import styles from './StatusBlock.module.css';

const DEFAULTS = {
  loading: { title: 'Загрузка…', message: 'Секунду, получаем данные.' },
  error: { title: 'Не удалось загрузить', message: 'Проверьте соединение и попробуйте снова.', actionLabel: 'Повторить' },
  empty: { title: 'Пусто', message: 'Здесь пока ничего нет.' },
};

/**
 * @param {{ kind: 'loading' | 'error' | 'empty', title?: string, message?: string,
 *   actionLabel?: string, onAction?: () => void }} props
 */
const StatusBlock = ({ kind, title, message, actionLabel, onAction }) => {
  const preset = DEFAULTS[kind] || DEFAULTS.empty;
  const heading = title ?? preset.title;
  const text = message ?? preset.message;
  const label = actionLabel ?? preset.actionLabel;

  return (
    <div className={`${styles.block} ${styles[kind] || ''}`} role={kind === 'error' ? 'alert' : 'status'}>
      {kind === 'loading' && <span className={styles.spinner} aria-hidden="true" />}
      <div className={styles.heading}>{heading}</div>
      {text && <div className={styles.message}>{text}</div>}
      {label && onAction && (
        <button type="button" className={styles.action} onClick={onAction}>
          {label}
        </button>
      )}
    </div>
  );
};

export default StatusBlock;
