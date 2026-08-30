import styles from './AlertBlock.module.css';

const typeToClassMap = {
  accepted: styles.accepted,
  error: styles.error,
};

const AlertBlock = ({ alerts, onDismiss }) => {
  return (
    <div className={styles.alerts}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${typeToClassMap[alert.type] || ''} ${styles.alert}`}
          role="status"
          onClick={() => onDismiss?.(alert.id)}
        >
          {alert.text}
        </div>
      ))}
    </div>
  );
};

export default AlertBlock;
