import styles from './util.module.css';

export const CardElement = ({prefix: PrefixIcon, suffix: SuffixIcon, children, url, wide}) => (
    <a href={url} className={styles.card_container} style={{ width: wide ? '100%' : 'fit-content' }}>
        {PrefixIcon && <PrefixIcon className={styles.card_icon_prefix} />}
        <div className={styles.card_content}>
            <div className={styles.card_title}>
                {children?.length ? children[0] : children}
            </div>
            {children?.length &&
                <div className={styles.card_subtitle}>
                    {children[1]}
                </div>
            }
        </div>
        {SuffixIcon && <SuffixIcon className={styles.card_icon_suffix} />}
    </a>
);