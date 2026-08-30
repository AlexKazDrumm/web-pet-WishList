import styles from './RenderGroups.module.css';
import { formatPlayers, convertAndFormatPrices } from '../../utils/utils';
import { fileUrl } from '../../lib/media';

const WishCard = ({ wish }) => (
  <div
    className={styles.wish}
    style={wish?.in_collection ? { backgroundColor: '#eef3dd' } : undefined}
  >
    <div className={styles.wishTitle}>{wish.title}</div>
    <div className={styles.wishImg}>
      {wish.cover_image ? (
        <img src={fileUrl(wish.cover_image)} alt={wish.title || ''} loading="lazy" />
      ) : (
        <span className={styles.noCover}>Нет обложки</span>
      )}
    </div>
    <div className={styles.players}>{formatPlayers(wish.min_players, wish.max_players)}</div>
    <div className={styles.prices}>Цена: {convertAndFormatPrices(wish.prices)}</div>
    {wish?.links?.map((link, index) => (
      <div key={index} className={styles.prices}>
        {index + 1}.{' '}
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      </div>
    ))}
  </div>
);

const GroupBlock = ({ title, description = null, wishes }) => (
  <div className={styles.groupBlock}>
    <div className={styles.groupTitle}>
      {title} ({wishes.length})
    </div>
    {description && <div className={styles.groupDescription}>{description}</div>}
    <div className={styles.wishesBlock}>
      {wishes.map((wish) => (
        <WishCard key={wish.id} wish={wish} />
      ))}
    </div>
  </div>
);

const RenderGroups = ({ groups, wishes, selectedGroup }) => {
  if (selectedGroup === 'all') {
    return (
      <div className={styles.component}>
        <GroupBlock title="Все" wishes={wishes} />
      </div>
    );
  }

  const grouped = groups
    .map((group) => ({
      group,
      wishes: wishes.filter((wish) => String(wish.group_id) === String(group.id)),
    }))
    .filter((entry) => entry.wishes.length > 0);

  return (
    <div className={styles.component}>
      {grouped.map(({ group, wishes: groupWishes }) => (
        <GroupBlock
          key={group.id}
          title={group.title}
          description={group.description}
          wishes={groupWishes}
        />
      ))}
    </div>
  );
};

export default RenderGroups;
