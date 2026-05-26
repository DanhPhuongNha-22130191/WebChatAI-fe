import React from 'react';
import styles from './Loading.module.css';

const Loading = ({
    gifUrl = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHc4aTk4am90NXJxNWJxZ2IzbnU1NDRpd3lnMDM5OTl4NWprcm1ybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/nh3ekNyWQYVoRC7gc4/giphy.gif",
}) => {
    return (
        <div className={styles.container}>
            <img className={styles.gif} src={gifUrl} alt="loading" />
        </div>
    );
};

export default Loading;
