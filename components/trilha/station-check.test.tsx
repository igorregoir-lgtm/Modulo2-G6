// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { StationCheck } from "./station-check";
import { MISSIONS } from "@/lib/trilha/missions";

afterEach(cleanup);

const mission = MISSIONS[0];
const correctIdx = mission.check.options.findIndex((o) => o.correct);
const wrongIdx = mission.check.options.findIndex((o) => !o.correct);

describe("StationCheck (interação predict-first)", () => {
  it("mostra o prompt e as opções, sem feedback nem concluir antes de escolher", () => {
    render(<StationCheck mission={mission} onComplete={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(mission.check.prompt)).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(mission.check.options.length);
    expect(screen.queryByText(/Concluir e voltar/i)).toBeNull();
  });

  it("revela o feedback ao escolher e chama onComplete ao concluir", () => {
    const onComplete = vi.fn();
    render(<StationCheck mission={mission} onComplete={onComplete} onCancel={() => {}} />);
    fireEvent.click(screen.getAllByRole("radio")[correctIdx]);
    // feedback da opção correta aparece
    expect(screen.getByText(mission.check.options[correctIdx].feedback)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Concluir e voltar/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("escolher errado mostra o feedback do errado E do correto (formativo)", () => {
    render(<StationCheck mission={mission} onComplete={() => {}} onCancel={() => {}} />);
    fireEvent.click(screen.getAllByRole("radio")[wrongIdx]);
    expect(screen.getByText(mission.check.options[wrongIdx].feedback)).toBeTruthy();
    expect(screen.getByText(mission.check.options[correctIdx].feedback)).toBeTruthy();
  });

  it("'Voltar à missão' chama onCancel", () => {
    const onCancel = vi.fn();
    render(<StationCheck mission={mission} onComplete={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /Voltar à missão/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
