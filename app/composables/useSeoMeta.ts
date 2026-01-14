export interface SeoMetaOptions {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  twitterCard?: string;
}

export const useSeoMetaConfig = () => {
  const siteUrl = "https://myhomefab.ru";
  const defaultSiteName = "MyHomeFab";
  const defaultLocale = "ru_RU";
  const defaultType = "website";
  const defaultTwitterCard = "summary_large_image";
  const defaultImage = `${siteUrl}/og-image.jpg`;

  const setSeoMeta = (options: SeoMetaOptions) => {
    const {
      title,
      description,
      image = defaultImage,
      imageAlt = title,
      url = siteUrl,
      type = defaultType,
      siteName = defaultSiteName,
      locale = defaultLocale,
      twitterCard = defaultTwitterCard,
    } = options;

    useSeoMeta({
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      ogImage: image,
      ogImageAlt: imageAlt,
      ogUrl: url,
      ogType: type as
        | "article"
        | "website"
        | "book"
        | "profile"
        | "music.song"
        | "music.album"
        | "music.playlist"
        | "music.radio_status"
        | "video.movie"
        | "video.episode"
        | "video.tv_show"
        | "video.other"
        | undefined,
      ogSiteName: siteName,
      ogLocale: locale,
      ogImageSecureUrl: image,
      twitterCard: twitterCard as
        | "summary"
        | "summary_large_image"
        | "app"
        | "player"
        | undefined,
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: image,
      twitterImageAlt: imageAlt,
    });
  };

  return {
    siteUrl,
    setSeoMeta,
  };
};
