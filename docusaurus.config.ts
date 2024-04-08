import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'روش‌های دوآپس',
  tagline: 'مرجع تخصصی دوآپس روشمند به فارسی',

  // Set the production url of your site here
  url: 'https://devopsways.ir',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'fa-IR',
    locales: ['fa-IR'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/devopsways-ir/docs/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'روش‌های دوآپس',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'مستندات',
        },
        {
          href: 'https://github.com/devopsways-ir/docs',
          label: 'گیت‌هاب',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'جامعه',
          items: [
            {
              label: 'کانال تلگرام',
              href: 'https://t.me/devopsways',
            },
            {
              label: 'گروه تلگرام',
              href: 'https://t.me/devopsways_group',
            },
          ],
        },
        {
          title: 'بیشتر',
          items: [
            {
              label: 'گیتهاب',
              href: 'https://github.com/devopsways-ir/docs',
            },
          ],
        },
      ],
      copyright: `حق کپی © ${new Date().toLocaleDateString('fa-IR', {year: "numeric"})} شمسی، جامعه روش‌های دوآپس - ساخته شده با Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
