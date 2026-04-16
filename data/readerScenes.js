export const readerScenes = {
  luna: {
    id: "luna",
    buttonArea: {
      left: "15.1%",
      top: "76.8%",
      width: "12.2%",
      height: "9.2%"
    },
    transitionVideoSrc: "/video/luna.mp4",
    readingBackgroundSrc: "/png/luan_place.png"
  },
  iris: {
    id: "iris",
    buttonArea: {
      left: "35.4%",
      top: "76.8%",
      width: "12.2%",
      height: "9.2%"
    },
    transitionVideoSrc: "/video/iris.mp4",
    readingBackgroundSrc: "/png/iris_place.png"
  },
  sol: {
    id: "sol",
    buttonArea: {
      left: "55.7%",
      top: "76.8%",
      width: "12.2%",
      height: "9.2%"
    },
    transitionVideoSrc: "/video/sol.mp4",
    readingBackgroundSrc: "/png/soul_place.png"
  },
  orion: {
    id: "orion",
    buttonArea: {
      left: "76%",
      top: "76.8%",
      width: "12.2%",
      height: "9.2%"
    },
    transitionVideoSrc: "/video/orion.mp4",
    readingBackgroundSrc: "/png/orion_place.png"
  }
};

export function getReaderScene(readerId) {
  return readerScenes[readerId] ?? null;
}
