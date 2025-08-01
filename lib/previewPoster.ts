export default function posterPreview(poster: string | null | undefined)  : { uri: string } | string {
      const defaultPoster = require("@/assets/images/default-banner.jpg");
      let posterParam = poster as string;
      if (poster) {
        return { uri: posterParam };
      } else {
        return defaultPoster;
      }
  }