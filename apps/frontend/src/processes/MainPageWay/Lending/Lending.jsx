import styles from './Lending.module.css';

const FEATURES = [
  { title: 'Вишлист', text: 'Собирайте желания в одном месте — со ссылками, ценами и обложками.' },
  { title: 'Настолки', text: 'Ведите коллекцию настольных игр и отмечайте, чего не хватает.' },
  { title: 'Свои списки', text: 'Заведите аккаунт и создавайте списки под любой повод.' },
];

const Lending = ({ onExplore }) => {
  return (
    <div className={styles.component}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Списки желаний без хаоса</h1>
        <p className={styles.subtitle}>
          Один аккуратный каталог вместо десятка заметок и вкладок. Смотрите готовые подборки или
          соберите собственные списки.
        </p>
        <button type="button" className={styles.cta} onClick={onExplore}>
          Открыть вишлист
        </button>
      </section>

      <section className={styles.features}>
        {FEATURES.map((feature) => (
          <article key={feature.title} className={styles.feature}>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Lending;
