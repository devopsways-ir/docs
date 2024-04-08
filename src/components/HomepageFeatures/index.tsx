import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'روشمند',
    Svg: require('@site/static/img/methodical.svg').default,
    description: (
      <>
        در این مستندات به جای این که به صرف نحوه نصب و تنظیم ابزارها پرداخته شود
        به روش‌ها و فرآیندهایی پرداخته می‌شود که دغدغه‌های مختلف سازمان را برطرف می کند و 
        به نحوه استفاده از خدمات دهندگان و به کارگیری ابزارهای لازم نیز پرداخته می‌شود.
      </>
    ),
  },
  {
    title: 'نوآور',
    Svg: require('@site/static/img/innovation.svg').default,
    description: (
      <>
        در این مستندات همواره سعی می‌شود که جدیدترین نوآوری حوزه دوآپس استفاده شود
        و روش‌های سنتی مورد نقد قرار گیرد.
      </>
    ),
  },
  {
    title: 'جامعه محور',
    Svg: require('@site/static/img/community.svg').default,
    description: (
      <>
        این مستندات به همت جامعه‌ای از فعالان حوزه دوآپس ایران تدوین و راهبری می‌شود
        و مالکیت خصوصی ندارد.
        اشخاص و شخصیت‌های حقوقی می‌توانند با مشارکت یا کمک‌های مالی از این جامعه حمایت کنند.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
