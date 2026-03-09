<script setup lang="ts">
import type { AdminPrompt } from "~/types/admin";
import adminPromptsStatic from "~/data/admin-prompts.json";

definePageMeta({
  middleware: "admin",
  layout: false,
});

const { isAuthenticated, login, logout } = useAdminAuth();

const password = ref("");
const loginError = ref("");
const isLoggingIn = ref(false);

const showLoginForm = computed(() => !isAuthenticated.value);

const handleLogin = async () => {
  if (!password.value) {
    loginError.value = "Введите пароль";
    return;
  }

  isLoggingIn.value = true;
  loginError.value = "";

  const result = await login(password.value);

  isLoggingIn.value = false;

  if (!result.success) {
    loginError.value = result.error || "Ошибка авторизации";
    password.value = "";
  }
};

const handleLogout = () => {
  logout();
  password.value = "";
};

type ContentTab = "notes" | "prompts";
const activeTab = ref<ContentTab>("notes");

const showPromptForm = ref(false);
const promptTitle = ref("");
const promptContent = ref("");
const editingPromptId = ref<string | null>(null);

const isDev = import.meta.dev;
const prompts = ref<AdminPrompt[]>([]);

async function loadPromptsFromServer() {
  if (!isDev) {
    prompts.value = Array.isArray(adminPromptsStatic) ? (adminPromptsStatic as AdminPrompt[]) : [];
    return;
  }
  try {
    const data = await $fetch<AdminPrompt[]>("/api/admin/prompts");
    prompts.value = Array.isArray(data) ? data : [];
  } catch {
    prompts.value = Array.isArray(adminPromptsStatic) ? (adminPromptsStatic as AdminPrompt[]) : [];
  }
}

async function savePromptsToServer() {
  if (!isDev) return;
  try {
    const response = await fetch("/api/admin/prompts/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompts.value),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("Ошибка при сохранении промптов:", error);
  }
}

onMounted(loadPromptsFromServer);

const handleSavePrompt = async () => {
  const title = promptTitle.value.trim();
  const content = promptContent.value.trim();
  if (!title && !content) {
    await handleDeletePrompt();
    return;
  }
  if (!content) {
    return;
  }
  if (editingPromptId.value) {
    const idx = prompts.value.findIndex((p) => p.id === editingPromptId.value);
    const prev = idx !== -1 ? prompts.value[idx] : undefined;
    if (prev) {
      prompts.value = prompts.value.map((p, i) =>
        i === idx
          ? { id: prev.id, createdAt: prev.createdAt, title: title || "Без названия", content }
          : p,
      );
    }
  } else {
    const newPrompt: AdminPrompt = {
      id: crypto.randomUUID(),
      title: title || "Без названия",
      content,
      createdAt: new Date().toISOString(),
    };
    prompts.value = [...prompts.value, newPrompt];
    editingPromptId.value = newPrompt.id;
  }
  await savePromptsToServer();
};

const handleDeletePrompt = async () => {
  if (editingPromptId.value) {
    prompts.value = prompts.value.filter((p) => p.id !== editingPromptId.value);
    await savePromptsToServer();
  }
  showPromptForm.value = false;
  promptTitle.value = "";
  promptContent.value = "";
  editingPromptId.value = null;
};

const openNewPromptForm = () => {
  showPromptForm.value = true;
  editingPromptId.value = null;
  promptTitle.value = "";
  promptContent.value = "";
};

const openPromptForEdit = (p: AdminPrompt) => {
  showPromptForm.value = true;
  editingPromptId.value = p.id;
  promptTitle.value = p.title;
  promptContent.value = p.content;
  nextTick(() => {
    document.getElementById("prompt-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

const removePrompt = async (id: string) => {
  prompts.value = prompts.value.filter((p) => p.id !== id);
  await savePromptsToServer();
};

const copyPromptContent = async () => {
  if (!promptContent.value) return;
  try {
    await navigator.clipboard.writeText(promptContent.value);
    copyFeedback.value = true;
    setTimeout(() => {
      copyFeedback.value = false;
    }, 1500);
  } catch {
    const ta = document.getElementById("prompt-content") as HTMLTextAreaElement;
    if (ta) {
      ta.select();
      document.execCommand("copy");
      copyFeedback.value = true;
      setTimeout(() => {
        copyFeedback.value = false;
      }, 1500);
    }
  }
};

const copyFeedback = ref(false);
</script>

<template>
  <div :class="$style.container">
    <div v-if="showLoginForm" :class="$style.loginContainer">
      <div :class="$style.loginCard">
        <h1 :class="$style.loginTitle">Админ-панель</h1>
        <p :class="$style.loginSubtitle">Введите пароль для доступа</p>

        <form :class="$style.loginForm" @submit.prevent="handleLogin">
          <div :class="$style.field">
            <label :class="$style.label" for="password">Пароль</label>
            <input
              id="password"
              v-model="password"
              type="password"
              :class="$style.input"
              placeholder="Введите пароль"
              autocomplete="current-password"
              @keyup.enter="handleLogin"
            />
          </div>

          <UButton
            type="submit"
            :loading="isLoggingIn"
            :disabled="isLoggingIn || !password"
            :class="$style.loginButton"
            block
          >
            {{ isLoggingIn ? "Вход..." : "Войти" }}
          </UButton>

          <UAlert
            v-if="loginError"
            color="error"
            variant="soft"
            :title="loginError"
            :class="$style.alert"
          />
        </form>
      </div>
    </div>

    <div v-else :class="$style.adminPanel">
      <div :class="$style.header">
        <h1 :class="$style.title">Ресурсы и заметки</h1>
        <div :class="$style.headerActions">
          <UButton color="neutral" variant="soft" @click="handleLogout">
            Выйти
          </UButton>
          <UButton
            color="neutral"
            variant="soft"
            to="/collections"
          >
            Коллекции
          </UButton>
        </div>
      </div>

      <div :class="$style.tabsBlock">
        <div :class="$style.tabsRow" role="tablist">
          <button
            id="tab-btn-notes"
            :class="[
              $style.tab,
              { [$style.tabActive]: activeTab === 'notes' },
            ]"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'notes'"
            @click="activeTab = 'notes'"
          >
            Заметки
          </button>
          <button
            id="tab-btn-prompts"
            :class="[
              $style.tab,
              { [$style.tabActive]: activeTab === 'prompts' },
            ]"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'prompts'"
            @click="activeTab = 'prompts'"
          >
            Промпты
          </button>
        </div>
        <div
          :id="activeTab === 'notes' ? 'tab-notes' : 'tab-prompts'"
          :class="$style.tabsContent"
          role="tabpanel"
          :aria-labelledby="activeTab === 'notes' ? 'tab-btn-notes' : 'tab-btn-prompts'"
        >
          <p v-if="activeTab === 'notes'" :class="$style.placeholder">
            Содержимое вкладки «Заметки»
          </p>
          <template v-else>
            <div :class="$style.promptsSection">
              <div v-if="prompts.length > 0" :class="$style.promptsList">
                <ul :class="$style.promptsListUl">
                  <li
                    v-for="p in prompts"
                    :key="p.id"
                    :class="$style.promptsListItem"
                  >
                    <a
                      :href="`#prompt-form`"
                      :class="$style.promptsListItemLink"
                      @click.prevent="openPromptForEdit(p)"
                    >
                      {{ p.title }}
                    </a>
                    <UButton
                      color="error"
                      variant="ghost"
                      size="xs"
                      aria-label="Удалить промпт"
                      :class="$style.promptsListItemDelete"
                      @click.stop="removePrompt(p.id)"
                    >
                      Удалить
                    </UButton>
                  </li>
                </ul>
              </div>
              <CoreAddButton
                label="Добавить промпт"
                aria-label="Добавить промпт"
                :class="$style.addPromptButton"
                @click="openNewPromptForm"
              />
              <div v-if="showPromptForm" id="prompt-form" :class="$style.promptFormBlock">
                <div :class="$style.field">
                  <label :class="$style.label" for="prompt-title">
                    Название промпта
                  </label>
                  <input
                    id="prompt-title"
                    v-model="promptTitle"
                    type="text"
                    :class="[$style.input, $style.inputBold]"
                    placeholder="Введите название"
                    autocomplete="off"
                  />
                </div>
                <div :class="$style.field">
                  <div :class="$style.promptCodeBlock">
                    <div :class="$style.promptCodeBlockHeader">
                      <span :class="$style.promptCodeBlockLabel">
                        Содержимое промпта
                      </span>
                      <button
                        type="button"
                        :class="$style.promptCodeBlockCopy"
                        :aria-label="copyFeedback ? 'Скопировано' : 'Копировать'"
                        :title="copyFeedback ? 'Скопировано' : 'Копировать в буфер'"
                        @click="copyPromptContent"
                      >
                        <span v-if="copyFeedback" :class="$style.promptCodeBlockCopyText">
                          Скопировано
                        </span>
                        <span v-else :class="$style.promptCodeBlockCopyIcon" aria-hidden="true">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </span>
                      </button>
                    </div>
                    <div :class="$style.promptCodeBlockBody">
                      <textarea
                        id="prompt-content"
                        v-model="promptContent"
                        :class="$style.textarea"
                        placeholder="Вставьте или введите содержимое промпта"
                        rows="6"
                      />
                    </div>
                  </div>
                </div>
                <div :class="$style.promptFormActions">
                  <UButton
                    color="primary"
                    @click="handleSavePrompt"
                  >
                    Сохранить
                  </UButton>
                  <UButton
                    color="error"
                    variant="soft"
                    @click="handleDeletePrompt"
                  >
                    Удалить
                  </UButton>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.container {
  min-height: 100vh;
  background: var(--a-accentDarkBg);
  padding: rem(20);

  @include tablet {
    padding: rem(40);
  }
}

.loginContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.loginCard {
  background: white;
  border-radius: rem(12);
  padding: rem(32);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: rem(400);
}

.loginTitle {
  font-size: rem(28);
  font-weight: 700;
  color: #1f2937;
  margin-bottom: rem(8);
  text-align: center;
}

.loginSubtitle {
  font-size: rem(14);
  color: #6b7280;
  margin-bottom: rem(24);
  text-align: center;
}

.loginForm {
  display: flex;
  flex-direction: column;
  gap: rem(20);
}

.field {
  display: flex;
  flex-direction: column;
  gap: rem(8);
}

.label {
  font-size: rem(14);
  font-weight: 500;
  color: #374151;
}

.input {
  padding: rem(12) rem(16);
  border: 1px solid #d1d5db;
  border-radius: rem(8);
  font-size: rem(14);
  color: var(--a-text-dark);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

.inputBold {
  font-weight: 700;
}

.loginButton {
  margin-top: rem(8);
}

.alert {
  margin-top: rem(8);
}

.adminPanel {
  max-width: rem(1400);
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(32);
  background: white;
  padding: rem(24);
  border-radius: rem(12);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.headerActions {
  display: flex;
  align-items: center;
  gap: rem(12);
}

.title {
  font-size: rem(28);
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.tabsBlock {
  background: var(--a-whiteBg);
  border-radius: rem(12);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabsRow {
  display: flex;
  gap: rem(16);
  padding: rem(16) rem(24);
  border-bottom: 1px solid var(--a-border);
  flex-wrap: wrap;

  @include tablet {
    gap: rem(24);
    padding: rem(20) rem(32);
  }
}

.tab {
  padding: rem(8) rem(24);
  background-color: var(--a-primaryBg);
  border: none;
  border-radius: var(--a-borderR--btn);
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-white);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }

  @include tablet {
    padding: rem(10) rem(28);
    font-size: rem(16);
  }
}

.tabActive {
  background-color: var(--a-accentBg);
  color: var(--a-text-white);
  font-weight: 600;
}

.tabsContent {
  padding: rem(24);

  @include tablet {
    padding: rem(32);
  }
}

.placeholder {
  margin: 0;
  color: var(--a-text-dark);
  opacity: 0.7;
  font-size: rem(15);
}

.promptsSection {
  display: flex;
  flex-direction: column;
  gap: rem(24);
}

.promptsList {
  padding: rem(16) rem(20);
  background: var(--a-whiteBg);
  border: 1px solid var(--a-border);
  border-radius: rem(10);
  margin-bottom: rem(8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.promptsListUl {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: rem(6);
}

.promptsListItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: rem(12);
  padding: rem(8) rem(10);
  border-radius: rem(6);
  transition: background 0.15s;

  &:hover {
    background: var(--a-mainBg);
  }
}

.promptsListItemLink {
  flex: 1;
  min-width: 0;
  font-size: rem(14);
  font-weight: 500;
  color: var(--a-text-dark);
  text-decoration: none;
  padding: rem(4) 0;
  border-radius: rem(4);
  transition: color 0.15s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--a-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--a-primary);
    outline-offset: 2px;
  }
}

.promptsListItemDelete {
  flex-shrink: 0;
}

.addPromptButton {
  align-self: flex-start;
}

.promptFormBlock {
  display: flex;
  flex-direction: column;
  gap: rem(20);
  padding: rem(24);
  background: var(--a-mainBg);
  border: 1px solid var(--a-border);
  border-radius: rem(12);
  scroll-margin-top: rem(24);
}

.promptFormActions {
  display: flex;
  gap: rem(12);
  flex-wrap: wrap;
  padding-top: rem(8);
  border-top: 1px solid var(--a-border);
  margin-top: rem(4);
}

/* Блок «код» для содержимого промта */
.promptCodeBlock {
  border-radius: rem(10);
  overflow: hidden;
  border: 1px solid #30363d;
  background: #0d1117;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.promptCodeBlockHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: rem(10) rem(14);
  background: #161b22;
  border-bottom: 1px solid #30363d;
  min-height: rem(44);
}

.promptCodeBlockLabel {
  font-size: rem(13);
  font-weight: 500;
  color: #8b949e;
  font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace;
}

.promptCodeBlockCopy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: rem(6);
  margin: rem(-6);
  border: none;
  border-radius: rem(6);
  background: transparent;
  color: #8b949e;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: #c9d1d9;
    background: rgba(110, 118, 129, 0.2);
  }

  &:focus-visible {
    outline: 2px solid #58a6ff;
    outline-offset: 2px;
  }
}

.promptCodeBlockCopyIcon {
  display: inline-flex;
  line-height: 0;
}

.promptCodeBlockCopyIcon svg {
  display: block;
}

.promptCodeBlockCopyText {
  font-size: rem(12);
  color: #3fb950;
  font-weight: 500;
}

.promptCodeBlockBody {
  padding: 0;
  background: #0d1117;
}

.textarea {
  width: 100%;
  padding: rem(14) rem(16);
  border: none;
  border-radius: 0;
  font-size: rem(13);
  line-height: 1.5;
  font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace;
  color: #c9d1d9;
  background: #0d1117;
  resize: vertical;
  min-height: rem(140);
  transition: box-shadow 0.2s;

  &::placeholder {
    color: #484f58;
  }

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 1px #58a6ff;
  }
}
</style>
