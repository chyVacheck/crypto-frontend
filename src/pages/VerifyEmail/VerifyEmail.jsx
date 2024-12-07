// ! modules
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ? styles
import styles from './VerifyEmail.module.css';

// * components
// SignForm
import SignForm from './../../components/SignForm/SignForm';

// ? utils
// * constants
import { paths } from './../../utils/constants';
// * utils
import { checkValidity, checkAnswerFromServer } from './../../utils/utils';
// * Api
import mainApi from './../../Api/MainApi';

function VerifyEmail({ setCurrentUser, addNotification, info, setLogin }) {
  // ? текст ошибки
  const [currentError, setCurrentError] = useState('');
  // ? текст кнопки submit
  const [currentTextSubmitButton, setCurrentTextSubmitButton] =
    useState('Verify email');

  const navigate = useNavigate();

  // * валидация полей
  const [validatedFields, setValidatedFields] = useState({
    code: true,
  });

  // * валидация всей формы
  const [isFormValid, setIsFormValid] = useState(false);

  // * Ref for every input
  const codeRef = useRef();

  // смена значение в input
  function handleFieldChange(event) {
    const isValid = event.target.checkValidity();

    // смена значение валидации
    const validatedKeyPare = {
      [event.target.id]: isValid,
    };
    setValidatedFields({ ...validatedFields, ...validatedKeyPare });
    // смена валидации формы
    setIsFormValid(event.target.closest('form').checkValidity() && isValid);
    // смена текста ошибки
    setCurrentError(checkValidity(event.target));
  }

  // авторизация
  async function handleSubmit(event) {
    event.preventDefault();
    setCurrentTextSubmitButton('Verify Email...');
    const user = {
      email: info.email,
      code: codeRef.current.value,
    };

    // отправляем запрос на проверку кода и окончательной регистрации
    mainApi
      .verifyEmail(user)
      .then(async (res) => {
        addNotification({
          name: 'Verify email',
          ok: true,
          text: res.message,
        });

        const userData = res.data;

        await mainApi
          .authorization({
            email: info.email,
            password: info.password,
          })
          .then((res) => {
            setLogin(true);

            userData.transactions = [];
            userData.currency = {};
            userData.wallets = [
              {
                _id: '746217360847ad5f36ab2284',
                currency: {
                  algorand: 0,
                  'avalanche-2': 0,
                  binancecoin: 0,
                  bitcoin: 0,
                  cardano: 0,
                  chainlink: 0,
                  dogecoin: 0,
                  ethereum: 0,
                  polkadot: 0,
                  ripple: 0,
                  solana: 0,
                  'terra-luna-2': 0,
                  tether: 0,
                  'usd-coin': 0,
                },
              },
              {
                _id: '747237370857cf5f36ab4048',
                currency: {
                  usd: 0,
                  eur: 0,
                },
              },
            ];

            setCurrentUser(userData);
            navigate(paths.user.profile);
          });
      })
      .catch((err) => {
        // устанавливаем ошибку
        if (err.status)
          if (err.message) {
            setCurrentError(err.message);
          } else {
            setCurrentError(checkAnswerFromServer(err.status, 'verifyEmail'));
          }
        else setCurrentError(checkAnswerFromServer('all', 'failFetch'));
        setIsFormValid(false);
      })
      .finally(() => {
        setCurrentTextSubmitButton('Verify Email');
      });
  }

  return (
    <section className={styles.main}>
      <SignForm
        title='Verify Email'
        submitButton={{
          text: currentTextSubmitButton,
        }}
        onSubmit={handleSubmit}
        onChange={handleFieldChange}
        error={currentError}
        isValid={isFormValid}
        inputs={[
          {
            name: 'Code',
            lang: 'en',
            placeholder: 'GS4UWA',
            type: 'text',
            id: 'code',
            required: true,
            ref: codeRef,
            isValid: validatedFields.code,
          },
        ]}
      />
    </section>
  );
}

export default VerifyEmail;
