import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig } from "payload";
import { anyone, isAdmin } from "../lib/access";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Images the owner uploads in /admin. Files land in public/media (git-ignored)
 * and are served from /media/<filename>. Production storage moves to a bucket
 * in the deploy task; the collection stays the same.
 */
export const Media: CollectionConfig = {
  slug: "media",
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: "alt",
  },
  upload: {
    staticDir: path.resolve(dirname, "../../public/media"),
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt текст (описание за екранни четци; празно за декоративни картинки)",
    },
  ],
};
