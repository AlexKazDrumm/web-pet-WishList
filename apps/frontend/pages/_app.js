import Head from 'next/head';
import '../styles/globals.css';
import { SessionProvider } from '../src/lib/session';
import { NotificationsProvider } from '../src/lib/notifications';
import Notifier from '../src/components/Notifier/Notifier';

export default function App({ Component, pageProps }) {
  return (
    <NotificationsProvider>
      <SessionProvider>
        <Head>
          <title>MyWishList</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Личные списки желаний и настольных игр" />
        </Head>
        <Notifier />
        <Component {...pageProps} />
      </SessionProvider>
    </NotificationsProvider>
  );
}
