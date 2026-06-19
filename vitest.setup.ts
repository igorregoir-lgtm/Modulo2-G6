// Garante a Web Storage API nos testes jsdom (este build do jsdom não expõe
// window.localStorage por padrão). No-op no ambiente node (window undefined).
if (typeof window !== "undefined" && !window.localStorage) {
  class MemStorage implements Storage {
    private m = new Map<string, string>();
    get length() {
      return this.m.size;
    }
    clear() {
      this.m.clear();
    }
    getItem(key: string) {
      return this.m.has(key) ? (this.m.get(key) as string) : null;
    }
    key(index: number) {
      return Array.from(this.m.keys())[index] ?? null;
    }
    removeItem(key: string) {
      this.m.delete(key);
    }
    setItem(key: string, value: string) {
      this.m.set(key, String(value));
    }
  }
  Object.defineProperty(window, "localStorage", {
    value: new MemStorage(),
    configurable: true,
  });
}
