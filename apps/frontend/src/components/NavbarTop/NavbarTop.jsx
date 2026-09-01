import styles from './NavbarTop.module.css';
import NavLink from '../UI/NavLink/NavLink';

const NavbarTop = ({ selectedBlock, setSelectedBlock, showMyLists }) => {
  return (
    <nav className={styles.container} aria-label="Основные разделы">
      <div className={styles.links}>
        <NavLink
          label="Главная"
          iconWhite="/svg/home_white.svg"
          iconBlue="/svg/home_blue.svg"
          isActive={selectedBlock === 1}
          onClick={() => setSelectedBlock(1)}
        />
        <NavLink
          label="Вишлист"
          iconWhite="/svg/fire_white.svg"
          iconBlue="/svg/fire_blue.svg"
          isActive={selectedBlock === 2}
          onClick={() => setSelectedBlock(2)}
        />
        <NavLink
          label="Настолки"
          iconWhite="/svg/dice_white.svg"
          iconBlue="/svg/dice_blue.svg"
          isActive={selectedBlock === 3}
          onClick={() => setSelectedBlock(3)}
        />
        <NavLink
          label="Книги"
          iconWhite="/svg/books_white.svg"
          iconBlue="/svg/books_blue.svg"
          isActive={selectedBlock === 4}
          onClick={() => setSelectedBlock(4)}
        />
        <NavLink
          label="Прочее"
          iconWhite="/svg/firework_white.svg"
          iconBlue="/svg/firework_blue.svg"
          isActive={selectedBlock === 5}
          onClick={() => setSelectedBlock(5)}
        />
        {showMyLists && (
          <NavLink
            label="Мои списки"
            iconWhite="/svg/fire_white.svg"
            iconBlue="/svg/fire_blue.svg"
            isActive={selectedBlock === 6}
            onClick={() => setSelectedBlock(6)}
          />
        )}
      </div>
    </nav>
  );
};

export default NavbarTop;
