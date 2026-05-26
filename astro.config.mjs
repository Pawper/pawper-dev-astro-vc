// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://pawper.dev',
  integrations: [react()],
  markdown: {
    shikiConfig: {
      langs: [
        { name: "bash-prompt",     scopeName: "source.bash-prompt",     patterns: [], repository: {} },
        { name: "bash-prompt-key", scopeName: "source.bash-prompt-key", patterns: [], repository: {} },
      ],
    },
  },
});
