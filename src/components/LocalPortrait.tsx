import { useEffect, useId, useRef, useState } from 'react';
import placeholder from '../assets/jungle/nursery-placeholder.webp';
import { useToast } from '../data/toast';
import { clearLocalPhoto, loadLocalPhoto, prepareLocalPhoto, saveLocalPhoto } from '../lib/localPhoto';

/** Optional nursery / ultrasound photo, stored only in this device's IndexedDB. */
export function LocalPortrait() {
  const { toast } = useToast();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState(placeholder);
  const [custom, setCustom] = useState(false);
  const urlRef = useRef<string | null>(null);

  const show = (blob: Blob | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    if (!blob) {
      setSrc(placeholder);
      setCustom(false);
      return;
    }
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    setSrc(url);
    setCustom(true);
  };

  useEffect(() => {
    let cancelled = false;
    void loadLocalPhoto()
      .then((blob) => {
        if (!cancelled && blob) show(blob);
      })
      .catch(() => {
        /* placeholder stays */
      });
    return () => {
      cancelled = true;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const blob = await prepareLocalPhoto(file);
      await saveLocalPhoto(blob);
      show(blob);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async () => {
    try {
      await clearLocalPhoto();
      show(null);
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  return (
    <div className="mx-auto mt-6 w-full max-w-[17rem]">
      <label
        htmlFor={inputId}
        className="block cursor-pointer overflow-hidden rounded-[1.5rem] bg-paper shadow-widget focus-within:outline-none"
      >
        <img
          src={src}
          alt={custom ? 'התמונה מהמשתלה או מאולטרסאונד' : 'איור של חדר תינוקות'}
          width={560}
          height={420}
          className="aspect-[4/3] w-full object-cover"
        />
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </label>
      <div className="mt-2 flex items-center justify-center gap-3 text-footnote">
        <label htmlFor={inputId} className="press cursor-pointer text-robin">
          {custom ? 'להחליף תמונה' : 'להוסיף תמונה מהמשתלה'}
        </label>
        {custom && (
          <button type="button" className="press text-brick" onClick={() => void remove()}>
            להסיר
          </button>
        )}
      </div>
      <p className="mt-1 text-center text-caption text-twig-soft">נשמרת רק במכשיר הזה, לא בענן.</p>
    </div>
  );
}
