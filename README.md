# 🏯 Aventuras por Assaí

Um jogo de plataforma 2D em **Pixel Art** com densidade uniforme (384×216 nativo), ambientado nas paisagens de **Assaí (PR)** nas cores **Azul França** e **Amarelo Imperial**.

🎮 **Jogue agora pelo navegador (PC e Celular):**  
👉 **[https://reginatomanu.github.io/Aventuras-por-Assai/](https://reginatomanu.github.io/Aventuras-por-Assai/)**

---

## ✨ Recursos

- **2 Personagens jogáveis:** **Sora** e **Riku**, com diálogo de abertura quebrando a 4ª parede.
- **3 Fases + 1 Fase Secreta:**
  1. **1-1 — Avenida dos Ipês (Dia):** cerejeiras, ipês brancos e amarelos, Toriis e cidade ao fundo com efeito paralaxe.
  2. **1-2 — Parque Ikeda (Entardecer):** laguinho com Torii iluminado, ponte apoiada sobre a água, plataformas móveis e uma passagem escondida para a fase secreta.
  3. **1-3 — Rumo ao Castelo (Noite):** noite estrelada com lanternas iluminando o caminho até o **Castelo Japonês de Assaí**.
  4. **★ — Jardim Secreto:** fase bônus repleta de flores de sakura e lanternas douradas!
- **Sistema de Pontuação e 3 Estrelas:**
  - Flores de Sakura: **+50 pts**
  - Lanternas Japonesas (acendem e soltam luzes ao bater a cabeça): **+300 pts** (douradas: **+500 pts**)
  - Bichinhos (derrotados pulando em cima): **+400 pts**
  - Tropeçar em um bichinho: perde **1 coração** e **-150 pts**
  - **3 Estrelas por fase:** concluir a fase, bater o tempo meta e atingir 60% da pontuação base.
- **Conquistas:** Iluminador (todas as lanternas da fase), Guardião de Assaí (todos os bichinhos da fase), Explorador (fase secreta), Três Estrelas e Intocável.
- **Trilha Sonora & Áudio 8-bit:** música procedural em escala pentatônica japonesa + efeitos sonoros com volumes independentes.
- **Configurações completas:** idioma (**Português**, **English**, **Español**), volume de música e SFX separados, tamanho do HUD, exibição/tamanho/opacidade dos botões touch, modo canhoto e tela cheia.
- **Ranking pronto para integração em aplicativos:** funciona localmente via `localStorage` e expõe `window.AventurasAssai` para integração com contas de usuários externos.

---

## 🔌 Integração com Aplicativo Externo

```js
// Define o jogador logado no app hospedeiro
window.AventurasAssai.setPlayer({ id: 'user-123', name: 'Manu' });

// Conecta o ranking ao seu backend
window.AventurasAssai.setRankingProvider({
  async submit(entry) { /* envia para sua API */ },
  async fetchTop(limit) { /* retorna array ordenado por score */ },
});

// Callbacks opcionais
window.AventurasAssai.onGameEnd = (result) => { console.log(result); };
window.AventurasAssai.onAchievement = (id) => { console.log('Conquista:', id); };
```

---

## 🕹️ Controles

- **PC:** `⬅️` / `➡️` ou `A` / `D` para mover · `Espaço`, `⬆️` ou `W` para pular · `P` ou `Esc` para pausar.
- **Celular / Tablet:** botões virtuais **`◀`**, **`▶`** e **`▲`** (tamanho, opacidade e modo canhoto ajustáveis nas Configurações).
