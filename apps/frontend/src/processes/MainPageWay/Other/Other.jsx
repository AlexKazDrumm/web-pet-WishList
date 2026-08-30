import styles from './Other.module.css';
import StatusBlock from '../../../components/UI/StatusBlock/StatusBlock';
import { useSession } from '../../../lib/session';

const Other = ({ onOpen }) => {
  const { isAuthenticated } = useSession();
  return (
    <div className={styles.component}>
      <StatusBlock
        kind="empty"
        title="Прочее"
        message={
          isAuthenticated
            ? 'Всё, что не попало в другие разделы: техника, впечатления, подарочные идеи. Создайте список в разделе «Прочее» на вкладке «Мои списки».'
            : 'Войдите, чтобы собирать здесь любые желания, которые не вписываются в остальные разделы.'
        }
        actionLabel={isAuthenticated ? 'Перейти к спискам' : 'Войти'}
        onAction={onOpen}
      />
    </div>
  );
};

export default Other;
