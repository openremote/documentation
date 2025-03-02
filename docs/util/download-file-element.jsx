import styles from './util.module.css';
import DownloadIcon from '@site/static/icon/download.svg';

export const DownloadFileElement = ({icon: Icon, children, url}) => (
    <a href={url} download className={styles.download_file_container}>
        {Icon && <Icon />}
        <span>{children}</span>
        <DownloadIcon className={styles.download_icon} />
    </a>
);