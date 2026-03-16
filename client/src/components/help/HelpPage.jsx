import React, { useState } from 'react';
import styles from './HelpPage.module.css';

function HelpPage({ onClose }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: 'Сколько ждать, прежде чем размещать объявление?',
      answer: 'Не ждите ни минуты! Размещайте пост сразу, как только поняли, что питомец не вернулся с прогулки. Первые часы — самые важные.'
    },
    {
      question: 'Я нашел котенка, но не могу оставить у себя. Что делать?',
      answer: 'Разместите пост на нашем сайте с пометкой «Ищу передержку» или «Ищу старых/новых хозяев». Пока ищутся хозяева, попробуйте договориться с друзьями или напишите в волонтерские группы — возможно, кто-то сможет приютить на время.'
    },
    {
      question: 'Нужно ли платить за размещение объявления?',
      answer: 'Нет, размещение объявлений о потере и находке животных на нашем сайте абсолютно бесплатно.'
    }
  ];

  return (
    <>
    <title>Как помочь?</title>
    <div className={styles.helpContainer}>
      <div className={styles.helpHeader}>
        <h1>Как можно помочь?</h1>
      </div>

      <div className={styles.helpContent}>
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>Первая помощь: чем накормить найденное животное?</h2>
          
          <p style={{ color: '#5F4834', fontSize: '16px', lineHeight: '1.6', marginBottom: '25px' }}>
            Вы нашли кошку или собаку на улице и забрали домой на время поисков хозяев? 
            Важно не навредить! Уличные животные могут быть истощены, и резкая смена питания им противопоказана.
          </p>

          <div className={styles.foodGrid}>
            <div className={styles.foodColumn}>
              <h3>Чем кормить собаку</h3>
              
              <h4 style={{ color: '#5F4834', marginBottom: '10px' }}> Можно:</h4>
              <ul className={styles.foodList}>
                <li className={styles.good}>Отварите курицу, индейку или говядину без соли и специй</li>
                <li className={styles.good}>Можно добавить немного риса</li>
                <li className={styles.good}>Нежирный творог, кефир, вареное яйцо</li>
                <li className={styles.good}>Сухой корм размочить в воде</li>
              </ul>

              <h4 style={{ color: '#5F4834', marginBottom: '10px' }}> Нельзя:</h4>
              <ul className={styles.foodList}>
                <li className={styles.bad}>Шоколад, сладкое</li>
                <li className={styles.bad}>Копчености</li>
                <li className={styles.bad}>Трубчатые кости (куриные) — они опасны для пищевода!</li>
              </ul>
            </div>

            <div className={styles.foodColumn}>
              <h3>Чем кормить кошку</h3>
              
              <h4 style={{ color: '#5F4834', marginBottom: '10px' }}> Можно:</h4>
              <ul className={styles.foodList}>
                <li className={styles.good}>Вареная куриная грудка (мелко нарезать)</li>
                <li className={styles.good}>Детское мясное пюре (без лука и крахмала)</li>
                <li className={styles.good}>Небольшое количество кефира или ряженки</li>
              </ul>

              <h4 style={{ color: '#5F4834', marginBottom: '10px' }}> Нельзя:</h4>
              <ul className={styles.foodList}>
                <li className={styles.bad}>Рыбу (особенно речную и сырую)</li>
                <li className={styles.bad}>Свинину</li>
                <li className={styles.bad}>Еду со своего стола (соленую, жареную)</li>
                <li className={styles.bad}>Молоко (у многих кошек непереносимость лактозы)</li>
              </ul>
            </div>
          </div>

          <div className={styles.universalTip}>
            <h3>💡 Если животное сильно истощено</h3>
            <p>
              Если животное сильно истощено, не перекармливайте его! <br /> Дайте еду маленькими порциями. 
              Лучше всего в первый день предложить немного вареного мяса или специальный лечебный корм 
              для чувствительного пищеварения (если есть возможность купить в ближайшем зоомагазине).
            </p>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>Первые шаги: подробная инструкция</h2>

          <h3 className={styles.cardSubtitle}>Если потеряли вы:</h3>
          <div className={styles.stepsList}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Сразу разместите пост</h4>
                <p>На нашем сайте (кнопка выше) и в городских группах.</p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Обыщите окрестности</h4>
                <p>
                  Животные часто прячутся в тихих местах рядом с домом: под машинами, в подвалах, на чердаках. 
                  Выходите на поиски ночью — в тишине их легче услышать.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Распечатайте объявления</h4>
                <p>
                  Возьмите скотч и 20-30 листовок. Расклейте их на остановках, столбах и досках в радиусе 1 км от места пропажи. 
                  Обязательно используйте наши шаблоны с отрывными номерами.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.cardSubtitle}>Если нашли вы:</h3>
          <div className={styles.stepsList}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Оцените состояние</h4>
                <p>
                  Если животное ранено, срочно везите его в ветклинику. 
                  Если просто испугано и голодно — накормите (см. раздел выше) и напоите.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Проверьте метки</h4>
                <p>
                  Посмотрите, есть ли на животном ошейник с адресником, бирка или клеймо. 
                  Отвезите в любую ветклинику проверить чип — это бесплатно.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Разместите объявление</h4>
                <p>О находке на нашем сайте. Не забудьте сделать фото!</p>
              </div>
            </div>
          </div>

          <h3 className={styles.cardSubtitle}>Часто задаваемые вопросы</h3>
          <div className={styles.faqList}>
            {faqData.map((item, index) => (
              <div key={index} className={styles.faqItem}>
                <div 
                  className={styles.faqQuestion} 
                  onClick={() => toggleFaq(index)}
                >
                  <h4>{item.question}</h4>
                  <span className={`${styles.faqIcon} ${openFaq === index ? styles.open : ''}`}>
                    {openFaq === index ? '✕' : '+'}
                  </span>
                </div>
                <div className={`${styles.faqAnswer} ${openFaq === index ? styles.open : ''}`}>
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.note}>
            <strong>Важно!</strong> Размещение объявлений о потере и находке животных на нашем сайте 
            абсолютно <strong>бесплатно</strong>. Помогите животным найти дом!
          </div>
        </div>
      </div>
    </div>
    </>
  );
  
}

export default HelpPage;