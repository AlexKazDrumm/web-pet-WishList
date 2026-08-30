import styles from './Books.module.css';
import StatusBlock from '../../../components/UI/StatusBlock/StatusBlock';
import { useSession } from '../../../lib/session';

const Books = ({ onOpen }) => {
  const { isAuthenticated } = useSession();
  return (
    <div className={styles.component}>
      <StatusBlock
        kind="empty"
        title="Книги"
        message={
          isAuthenticated
            ? 'Заведите список в разделе «Книги» на вкладке «Мои списки», чтобы собирать сюда желаемые издания.'
            : 'Войдите, чтобы вести список книг, которые хочется прочитать или подарить.'
        }
        actionLabel={isAuthenticated ? 'Перейти к спискам' : 'Войти'}
        onAction={onOpen}
      />
    </div>
  );
};

export default Books;
