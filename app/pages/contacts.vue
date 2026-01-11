<script setup lang="ts">
import EmailIcon from "~/assets/icons/Email.svg";
import TelegramIcon from "~/assets/icons/Telegram.svg";

definePageMeta({
  layout: "default",
});

const { setSeoMeta, siteUrl } = useSeoMetaConfig();

const pageTitle = "Контакты - 3D Мастерская";
const pageDescription =
  "Свяжитесь со мной для вопросов о 3D моделях, заказах и сотрудничестве. Email: mike@ivanov-post.ru";

setSeoMeta({
  title: pageTitle,
  description: pageDescription,
  imageAlt: pageTitle,
  url: `${siteUrl}/contacts`,
});

const email = "mike@ivanov-post.ru";
const telegramChannel = "https://t.me/homefab3d";
</script>

<template>
  <div>
    <main :class="$style.main">
      <header :class="$style.header">
        <div :class="$style.container">
          <h1 :class="$style.title">{{ $t("contacts.title") }}</h1>
          <p :class="$style.subtitle">{{ $t("contacts.subtitle") }}</p>
        </div>
      </header>

      <section :class="$style.content">
        <div :class="$style.container">
          <div :class="$style.contactsGrid">
            <article :class="$style.contactCard">
              <div :class="$style.iconWrapper">
                <EmailIcon :class="$style.icon" />
              </div>
              <h2 :class="$style.cardTitle">{{ $t("contacts.email.title") }}</h2>
              <a :href="`mailto:${email}`" :class="$style.contactLink">
                {{ email }}
              </a>
            </article>

            <article :class="$style.contactCard">
              <div :class="$style.iconWrapper">
                <TelegramIcon :class="$style.icon" />
              </div>
              <h2 :class="$style.cardTitle">{{ $t("contacts.telegram.title") }}</h2>
              <a :href="telegramChannel" target="_blank" rel="noopener noreferrer" :class="$style.contactLink">
                @homefab3d
              </a>
            </article>
          </div>
        </div>
      </section>
    </main>
    <LayoutFooter />
  </div>
</template>

<style module lang="scss">
.main {
  min-height: calc(100vh - var(--header-height, 80px));
  padding-top: var(--header-height, 80px);
}

.header {
  padding: rem(60) rem(20);
  background: linear-gradient(180deg, var(--a-whiteBg) 0%, var(--a-mainBg) 100%);
  text-align: center;

  @include tablet {
    padding: rem(80) rem(32);
  }

  @include desktop {
    padding: rem(100) rem(48);
  }
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: rem(36);
  font-weight: 600;
  color: var(--a-text-dark);
  margin: 0 0 rem(16) 0;
  line-height: 1.2;

  @include tablet {
    font-size: rem(48);
  }

  @include desktop {
    font-size: rem(56);
  }
}

.subtitle {
  font-size: rem(18);
  color: var(--a-text-light);
  margin: 0;
  line-height: 1.6;

  @include tablet {
    font-size: rem(20);
  }

  @include desktop {
    font-size: rem(22);
  }
}

.content {
  padding: rem(40) rem(20);
  background-color: var(--a-whiteBg);

  @include tablet {
    padding: rem(60) rem(32);
  }

  @include desktop {
    padding: rem(80) rem(48);
  }
}

.contactsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: rem(24);

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: rem(32);
  }

  @include desktop {
    gap: rem(40);
  }
}

.contactCard {
  background: linear-gradient(135deg, var(--a-whiteBg) 0%, var(--a-lightPrimaryBg) 100%);
  border: 1px solid var(--a-border);
  border-radius: var(--a-borderR--card);
  padding: rem(40) rem(32);
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 rem(4) rem(16) rgba(0, 0, 0, 0.05);

  @include tablet {
    padding: rem(48) rem(40);
  }

  @include desktop {
    padding: rem(56) rem(48);

    &:hover {
      transform: translateY(rem(-4));
      box-shadow: 0 rem(8) rem(24) rgba(0, 0, 0, 0.1);
      border-color: var(--a-border-primary);
    }
  }
}

.iconWrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: rem(80);
  height: rem(80);
  margin: 0 auto rem(24) auto;
  background-color: var(--a-primaryBg);
  border-radius: 50%;
  transition: transform 0.3s ease;

  @include desktop {
    .contactCard:hover & {
      transform: scale(1.1);
    }
  }
}

.icon {
  width: rem(40);
  height: rem(40);
  color: var(--a-text-white);
}

.cardTitle {
  font-size: rem(20);
  font-weight: 500;
  color: var(--a-text-dark);
  margin: 0 0 rem(16) 0;

  @include tablet {
    font-size: rem(22);
  }

  @include desktop {
    font-size: rem(24);
  }
}

.contactLink {
  display: inline-block;
  font-size: rem(18);
  font-weight: 500;
  color: var(--a-text-primary);
  text-decoration: none;
  padding: rem(12) rem(24);
  border-radius: var(--a-borderR--btn);
  background-color: var(--a-lightPrimaryBg);
  border: 1px solid var(--a-border-primary);
  transition: all 0.3s ease;

  @include tablet {
    font-size: rem(20);
    padding: rem(14) rem(28);
  }

  @include desktop {
    font-size: rem(22);
    padding: rem(16) rem(32);

    &:hover {
      background-color: var(--a-primaryBg);
      color: var(--a-text-white);
      border-color: var(--a-primaryBg);
      transform: translateY(rem(-2));
      box-shadow: 0 rem(4) rem(12) rgba(59, 130, 246, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>
