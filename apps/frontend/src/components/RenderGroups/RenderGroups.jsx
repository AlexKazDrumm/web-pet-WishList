import { useState } from 'react';
import styles from './RenderGroups.module.css';
import { formatPlayers, convertAndFormatPrices } from '../../utils/utils';
import { fileUrl } from '../../lib/media';

const WishCard = ({ wish }) => {
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = wish.cover_image && !coverFailed;
  return (
    <article
      className={styles.wish}
      style={wish?.in_collection ? { backgroundColor: '#eef3dd' } : undefined}
    >
      <h3 className={styles.wishTitle}>{wish.title}</h3>
      <div className={styles.wishImg}>
        {showCover ? (
          <img
            src={fileUrl(wish.cover_image)}
            alt={wish.title || ''}
            loading="lazy"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <span className={styles.noCover}>Нет обложки</span>
        )}
      </div>
      <div className={styles.players}>{formatPlayers(wish.min_players, wish.max_players)}</div>
      <div className={styles.prices} title="Ориентировочный пересчёт в тенге по справочному курсу">
        Цена: {convertAndFormatPrices(wish.prices)}
      </div>
      {wish.instruction && (
        <div className={styles.prices}>
          <a href={fileUrl(wish.instruction)} target="_blank" rel="noopener noreferrer">
            Правила игры
          </a>
        </div>
      )}
      {wish?.links?.map((link, index) => (
        <div key={`${link}-${index}`} className={styles.prices}>
          {index + 1}.{' '}
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link}
          </a>
        </div>
      ))}
    </article>
  );
};

const GroupBlock = ({ title, description = null, wishes }) => (
  <section className={styles.groupBlock}>
    <h2 className={styles.groupTitle}>
      {title} ({wishes.length})
    </h2>
    {description && <div className={styles.groupDescription}>{description}</div>}
    <div className={styles.wishesBlock}>
      {wishes.map((wish) => (
        <WishCard key={wish.id} wish={wish} />
      ))}
    </div>
  </section>
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
