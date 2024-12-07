// ! modules
import { useState, useRef } from 'react';

// ? styles
import s from './Support.module.css';

// ? Api
import mainApi from './../../Api/MainApi';

// ? components
import Input from '../../components/Input/Input';

// ? utils
// * constants
import { VALIDATION } from '../../utils/constants';
// * utils
import { checkValidity } from '../../utils/utils';

function Support({ addNotification }) {
  // ? текст кнопки submit
  const [currentTextSubmitButton, setCurrentTextSubmitButton] =
    useState('Send mail');

  // * валидация полей
  const [validatedFields, setValidatedFields] = useState({
    title: { valid: true, error: null },
    message: { valid: true, error: null },
  });

  const titleRef = useRef();
  const messageRef = useRef();

  // * валидация всей формы
  const [isFormValid, setIsFormValid] = useState(false);

  // отправка сообщения
  function handleSubmit(event) {
    event.preventDefault();
    setCurrentTextSubmitButton('Sending...');
    setIsFormValid(false);

    mainApi
      .sendMailToSupport({
        title: titleRef.current.value,
        message: messageRef.current.value,
      })
      .then((res) => {
        addNotification({
          name: 'Send message',
          ok: true,
          text: res.message,
        });
        titleRef.current.value = null;
        messageRef.current.value = null;
      })
      .catch((err) => {
        addNotification({
          name: 'Send message',
          ok: false,
          text: err.message,
        });
      })
      .finally(() => {
        setCurrentTextSubmitButton('Send mail');
      });
  }

  // смена значение в input
  function handleFieldChange(event) {
    const isValid = event.target.checkValidity();

    // смена значение валидации
    const validatedKeyPare = {
      [event.target.id]: { valid: isValid, error: checkValidity(event.target) },
    };
    setValidatedFields({ ...validatedFields, ...validatedKeyPare });
    // смена валидации формы
    setIsFormValid(event.target.closest('form').checkValidity() && isValid);
  }

  return (
    <section className={s.main}>
      {/* <article className={s.container}> */}
      <form onSubmit={handleSubmit} className={s.form}>
        {/* // ? input поля */}
        <div className={s.fields}>
          {/* // ? Title */}
          <Input
            name={'Title'}
            required
            id='title'
            placeholder={'Title'}
            minLength={VALIDATION.TITLE.MIN}
            maxLength={VALIDATION.TITLE.MAX}
            customRef={titleRef}
            onChange={handleFieldChange}
            isValid={validatedFields.title.valid}
            textError={validatedFields.title.error}
          ></Input>

          {/* // ? Message */}
          <div className={s.field}>
            <h6 className={`${s.name} caption`}>Message</h6>

            <textarea
              required
              className={`landing-input ${s.input} ${s.input_type_message} ${
                !validatedFields.message.valid ? s.input_validity_invalid : ''
              }`}
              placeholder='Please text your message to support here'
              id='message'
              type='text'
              minLength={VALIDATION.MESSAGE.MIN}
              maxLength={VALIDATION.MESSAGE.MAX}
              ref={messageRef}
              onChange={handleFieldChange}
            ></textarea>

            {/* // ? сообщение о ошибке */}
            <p className={`${s['error-message']} detail`}>
              {validatedFields.message.error}
            </p>
          </div>
        </div>

        {/* // ? кнопка submit */}
        <button
          disabled={!isFormValid}
          className={`button ${s.submit}`}
          type='submit'
        >
          {currentTextSubmitButton}
        </button>
      </form>
      {/* </article> */}
    </section>
  );
}

export default Support;
