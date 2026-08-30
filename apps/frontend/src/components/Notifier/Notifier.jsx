import styles from './Notifier.module.css';
import AlertBlock from '../UI/AlertBlock/AlertBlock';
import { useNotifications } from '../../lib/notifications';

const Notifier = () => {
  const { items, dismiss } = useNotifications();
  return (
    <div className={styles.container}>
      <AlertBlock alerts={items} onDismiss={dismiss} />
    </div>
  );
};

export default Notifier;
