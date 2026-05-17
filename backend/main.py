from datetime import datetime, timezone
from io import BytesIO
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.pkl"

app = FastAPI(title="Gym Churn Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # em produção, troque pelo domínio da Vercel
    allow_methods=["*"],
    allow_headers=["*"],
)

FEATURES = [
    "Lifetime",
    "Avg_class_frequency_current_month",
    "Age",
    "Contract_period",
    "Month_to_end_contract",
    "Avg_class_frequency_total",
    "Avg_additional_charges_total",
    "Group_visits",
    "Promo_friends",
    "Partner",
    "Near_Location",
]

def load_model():
    if not MODEL_PATH.exists():
        return None
    return joblib.load(MODEL_PATH)

# Valores de referência usados quando o usuário informa só parte dos campos.
# Eles mantêm a predição possível, mas quanto menos dados reais, menor a confiança.
DEFAULT_FEATURE_VALUES = {
    "Lifetime": 4,
    "Avg_class_frequency_current_month": 2.0,
    "Age": 29,
    "Contract_period": 6,
    "Month_to_end_contract": 4.0,
    "Avg_class_frequency_total": 2.0,
    "Avg_additional_charges_total": 150.0,
    "Group_visits": 0,
    "Promo_friends": 0,
    "Partner": 0,
    "Near_Location": 1,
}

model = load_model()
feature_defaults = DEFAULT_FEATURE_VALUES.copy()
last_training_info = None

class CustomerData(BaseModel):
    Lifetime: int | None = None                              # meses como cliente
    Avg_class_frequency_current_month: float | None = None   # aulas/semana esse mês
    Age: int | None = None                                   # idade
    Contract_period: int | None = None                       # duração do contrato (meses)
    Month_to_end_contract: float | None = None               # meses até vencer o contrato
    Avg_class_frequency_total: float | None = None           # aulas/semana histórico
    Avg_additional_charges_total: float | None = None        # gastos extras (US$)
    Group_visits: int | None = None                          # faz aulas em grupo? (0 ou 1)
    Promo_friends: int | None = None                         # veio por indicação? (0 ou 1)
    Partner: int | None = None                               # empresa parceira? (0 ou 1)
    Near_Location: int | None = None                         # mora perto? (0 ou 1)

class PredictionResponse(BaseModel):
    churn_probability: float
    churn_label: str
    risk_level: str

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "model": "gym-churn-v1",
        "model_loaded": model is not None,
        "trained_at": last_training_info["trained_at"] if last_training_info else None,
        "metrics": last_training_info["metrics"] if last_training_info else None,
    }

@app.post("/train")
async def train_from_csv(file: UploadFile = File(...)):
    global model, feature_defaults, last_training_info

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Envie um arquivo CSV válido.")

    try:
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Não foi possível ler o CSV: {exc}",
        ) from exc

    required_columns = FEATURES + ["Churn"]
    missing_columns = [column for column in required_columns if column not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"CSV sem colunas obrigatórias: {', '.join(missing_columns)}",
        )

    # Limpa a base enviada e mantém somente as colunas usadas na primeira versão.
    df = df[required_columns].drop_duplicates().dropna()
    if len(df) < 10:
        raise HTTPException(
            status_code=400,
            detail="CSV com poucos registros válidos para treino após limpeza.",
        )

    X = df[FEATURES]
    y = df["Churn"]

    if y.nunique() < 2 or y.value_counts().min() < 2:
        raise HTTPException(
            status_code=400,
            detail="A coluna Churn precisa ter exemplos suficientes das classes 0 e 1.",
        )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    trained_model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        n_jobs=-1,
    )
    trained_model.fit(X_train, y_train)

    y_pred = trained_model.predict(X_test)
    y_proba = trained_model.predict_proba(X_test)[:, 1]

    metrics = {
        "rows_used": int(len(df)),
        "test_rows": int(len(X_test)),
        "churn_rate": round(float(y.mean()), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_proba)), 4),
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
    }

    # Atualiza os valores de referência usados quando a inferência recebe campos parciais.
    feature_defaults = {
        feature: float(X[feature].median())
        for feature in FEATURES
    }
    for binary_feature in ["Group_visits", "Promo_friends", "Partner", "Near_Location"]:
        feature_defaults[binary_feature] = int(X[binary_feature].mode().iloc[0])

    model = trained_model
    joblib.dump(model, MODEL_PATH)
    last_training_info = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "filename": file.filename,
        "metrics": metrics,
    }

    return {
        "status": "trained",
        "model_loaded": True,
        "trained_at": last_training_info["trained_at"],
        "filename": file.filename,
        "metrics": metrics,
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(data: CustomerData):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo não treinado. Faça upload do CSV na aba Upload CSV.",
        )

    input_data = data.model_dump()
    informed_fields = sum(value is not None for value in input_data.values())

    if informed_fields < 2:
        raise HTTPException(
            status_code=400,
            detail="Informe pelo menos 2 campos para calcular o risco de churn.",
        )

    # Completa campos ausentes com valores de referência e mantém a ordem do treino.
    feature_values = [
        input_data[field]
        if input_data[field] is not None
        else feature_defaults[field]
        for field in FEATURES
    ]
    features = pd.DataFrame([feature_values], columns=FEATURES)

    prob = model.predict_proba(features)[0][1]

    if prob >= 0.7:
        label, level = "Alto Risco de Churn", "high"
    elif prob >= 0.4:
        label, level = "Risco Médio de Churn", "medium"
    else:
        label, level = "Baixo Risco de Churn", "low"

    return PredictionResponse(
        churn_probability=round(float(prob), 4),
        churn_label=label,
        risk_level=level,
    )
