import { useState, useEffect } from 'react';

const cache: Record<string, string> = {};

export const useWikipediaImage = (wikiTitle: string) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!wikiTitle) return;

    if (cache[wikiTitle]) {
      setImage(cache[wikiTitle]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=600&origin=*`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const pages = data.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pages[pageId].thumbnail) {
            const source = pages[pageId].thumbnail.source;
            cache[wikiTitle] = source;
            setImage(source);
          } else {
            setImage(null);
          }
        }
      })
      .catch(err => {
        console.error("Failed to fetch image for", wikiTitle, err);
        setImage(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [wikiTitle]);

  return { image, loading };
};
