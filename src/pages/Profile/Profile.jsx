/* eslint-disable react-hooks/exhaustive-deps */
// ! modules
import { useState, useRef, useContext, useEffect } from 'react';
import axios from 'axios';
import SumsubWebSdk from '@sumsub/websdk-react';
// import snsWebSdk from '@sumsub/websdk';

// ? styles
import s from './Profile.module.css';

// ? Api
import mainApi from './../../Api/MainApi';

// ? components
// import DropdownInput from '../../components/DropdownInput/DropdownInput';
import File from '../../components/File/File';
import Input from '../../components/Input/Input';
import Popup from './../../components/Popup/Popup';

// ? contexts
import { CurrentUserContext } from '../../contexts/CurrentUserContext';

// ? utils
// * constants
import { VALIDATION, paths /*, TYPE_OF_USER */ } from '../../utils/constants';
// * utils
// * constants
import { checkValidity, checkValueIfNotNull, copy } from '../../utils/utils';

function Profile({ addNotification, setUser }) {
  const userData = useContext(CurrentUserContext);
  // ? текст кнопки submit
  const [currentTextSubmitButton, setCurrentTextSubmitButton] =
    useState('Save data');

  // * валидация полей
  const [validatedFields, setValidatedFields] = useState({
    name: { valid: true, error: null },
    secondName: { valid: true, error: null },
    phone: { valid: true, error: null },
    typeOfUserRef: { valid: true, error: null },
  });

  // * валидация всей формы
  const [isFormValid, setIsFormValid] = useState(false);
  // * измененная ли форма
  const [hasFormAnotherData, setFormAnotherData] = useState(false);
  // * загружены ли документы
  const [isFilesDownloaded, setFilesDownloaded] = useState(false);

  // * открыт ли popup
  const [isPopupOpen, setPopupOpen] = useState(false);

  // текущий открытый файл
  const [currenFile, setCurrenFile] = useState({
    src: null,
    alt: null,
    title: null,
    type: null,
  });

  // * Ref for every input
  const nameRef = useRef();
  const secondNameRef = useRef();
  const phoneRef = useRef();
  // const typeOfUserRef = useRef();

  // ? handle Change
  function handleFieldChange(event) {
    setFormAnotherData(true);
    const isValid = event.target.checkValidity();

    // смена значение валидации
    const validatedKeyPare = {
      [event.target.id]: { valid: isValid, error: checkValidity(event.target) },
    };
    setValidatedFields({ ...validatedFields, ...validatedKeyPare });
    // смена валидации формы
    setIsFormValid(
      event.target.closest('form').checkValidity() &&
        isValid &&
        (userData.name !== checkValueIfNotNull(nameRef.current.value) ||
          userData.secondName !==
            checkValueIfNotNull(secondNameRef.current.value) ||
          userData.phone !== checkValueIfNotNull(phoneRef.current.value)) /* ||
          userData.typeOfUser !== typeOfUserRef.current.value), */,
    );
  }

  // ? handle upload file to server
  function uploadFileToServer(data) {
    const file = new FormData();

    file.append('file', data.file);
    mainApi
      .putUserFile({
        file: file,
        typeOfFile: data.typeOfFile,
      })
      .then(async (res) => {
        const imageUrl = URL.createObjectURL(data.file);

        const _newUserData = userData;

        _newUserData[data.typeOfFile] = {
          url: imageUrl,
          type: data['Content-Type'],
        };

        setUser(_newUserData);

        addNotification({
          name: 'Upload file',
          ok: true,
          text: res.message,
        });
      })
      .catch((err) => {
        addNotification({
          name: 'Upload file',
          ok: false,
          text: err.message,
        });
      });
  }

  // ?
  function openFile(file) {
    setCurrenFile(file);
    setPopupOpen(true);
  }

  // ? handle submit form
  async function handleSubmit(e) {
    setCurrentTextSubmitButton('Saving data...');
    e.preventDefault();

    await mainApi
      .updateUserData({
        name: checkValueIfNotNull(nameRef.current.value),
        secondName: checkValueIfNotNull(secondNameRef.current.value),
        phone: checkValueIfNotNull(phoneRef.current.value),
      })
      .then((res) => {
        addNotification({
          name: 'Update user data',
          ok: true,
          text: res.message,
        });

        const _newUserData = userData;

        _newUserData.name = res.data.name;
        _newUserData.secondName = res.data.secondName;
        _newUserData.phone = res.data.phone;

        setUser(_newUserData);
      })
      .catch((err) => {
        // устанавливаем ошибку
        addNotification({
          name: 'Update user data',
          ok: false,
          text: err.message,
        });
        setIsFormValid(false);
      })
      .finally(() => {
        setCurrentTextSubmitButton('Save data');
        setIsFormValid(false);
      });
  }

  async function deleteFileOnServer(e, typeOfFile) {
    e.preventDefault();

    await mainApi
      .deleteUserFile(typeOfFile)
      .then((res) => {
        addNotification({
          name: `Delete file`,
          ok: true,
          text: res.message,
        });

        const _newUserData = userData;

        delete _newUserData[typeOfFile];

        setUser(_newUserData);
      })
      .catch((err) => {
        // устанавливаем ошибку
        addNotification({
          name: 'Update user data',
          ok: false,
          text: err.message,
        });
      });
  }

  async function _getFileData(contentType, typeOfFile) {
    await mainApi
      .getUserFile({
        'Content-Type': contentType,
        typeOfFile: typeOfFile,
      })
      .then(async (res) => {
        const blob = await res.blob();
        const imageUrl = URL.createObjectURL(blob);

        const _newUserData = userData;

        _newUserData[typeOfFile].url = imageUrl;

        setUser(_newUserData);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    nameRef.current.value = userData.name;
    secondNameRef.current.value = userData.secondName;
    phoneRef.current.value = userData.phone;
    // typeOfUserRef.current.value = userData.typeOfUser;
  }, [userData]);

  useEffect(() => {
    async function _fetchData() {
      // ? passport
      if (userData.passport && !userData.passport.url)
        await _getFileData(userData.passport.type, 'passport');

      // ? proof of address
      if (userData.proofOfAddress && !userData.proofOfAddress.url)
        await _getFileData(userData.proofOfAddress.type, 'proofOfAddress');

      // ? selfie with ID or Passport
      if (
        userData.selfieWithIDOrPassport &&
        !userData.selfieWithIDOrPassport.url
      )
        await _getFileData(
          userData.selfieWithIDOrPassport.type,
          'selfieWithIDOrPassport',
        );

      setFilesDownloaded(true);
    }

    _fetchData();
  }, [setUser, userData, isFilesDownloaded, _getFileData]);

  /**
   * @param accessToken - access token that you generated on the backend in Step 2
   * @param applicantEmail - applicant email (not required)
   * @param applicantPhone - applicant phone, if available (not required)
   * @param customI18nMessages - customized locale messages for current session (not required)
   */

  const accessToken = 'aP4qZH0o32pP3AkNDGpMDskiFLVX2c81';
  // applicantEmail,
  // applicantPhone,
  // customI18nMessages,

  const SUMSUB_APP_TOKEN =
    'sbx:VOAiGy8VJhEm5ClokHgl7dMC.4nvRh5gBO26YHTyDOFxN75E4ouN55ahw'; // Example: sbx:uY0CgwELmgUAEyl4hNWxLngb.0WSeQeiYny4WEqmAALEAiK2qTC96fBad - Please don't forget to change when switching to production
  const SUMSUB_SECRET_KEY = 'aP4qZH0o32pP3AkNDGpMDskiFLVX2c81'; // Example: Hej2ch71kG2kTd1iIUDZFNsO5C1lh5Gq - Please don't forget to change when switching to production
  const SUMSUB_BASE_URL = 'https://api.sumsub.com';

  var config = {
    baseURL: SUMSUB_BASE_URL,
  };

  axios.interceptors.request.use(createSignature, function (error) {
    return Promise.reject(error);
  });

  // Make sure to specify 'Content-Type' header with value of 'application/json' if you're not sending a body for most of requests

  // This function creates signature for the request as described here: https://developers.sumsub.com/api-reference/#app-tokens

  function createSignature(config) {
    console.log('Creating a signature for the request...');

    var ts = Math.floor(Date.now() / 1000);
    const signature = crypto.createHmac('sha256', SUMSUB_SECRET_KEY);
    signature.update(ts + config.method.toUpperCase() + config.url);

    if (config.data instanceof FormData) {
      signature.update(config.data.getBuffer());
    } else if (config.data) {
      signature.update(config.data);
    }

    config.headers['X-App-Access-Ts'] = ts;
    config.headers['X-App-Access-Sig'] = signature.digest('hex');

    return config;
  }

  function createAccessToken(
    externalUserId,
    levelName = 'basic-kyc-level',
    ttlInSecs = 600,
  ) {
    console.log('Creating an access token for initializng SDK...');

    var method = 'post';
    var url =
      '/resources/accessTokens?userId=' +
      encodeURIComponent(externalUserId) +
      '&ttlInSecs=' +
      ttlInSecs +
      '&levelName=' +
      encodeURIComponent(levelName);

    var headers = {
      Accept: 'application/json',
      'X-App-Token': SUMSUB_APP_TOKEN,
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = null;

    return config;
  }

  return (
    <>
      <section className={s.main}>
        <article className={s.container}>
          <form onSubmit={handleSubmit} className={s.form}>
            {/* // ? поля для просмотра */}
            <div className={s.infos}>
              {/* // ? Email */}
              <div className={s.info}>
                <h6 className={`${s.name} caption`}>Email</h6>

                <p
                  className={`copy ${s.text}`}
                  onClick={() => {
                    copy(userData.email);
                  }}
                >
                  {userData.email}
                </p>
              </div>

              {/* // ? Id */}
              <div className={s.info}>
                <h6 className={`${s.name} caption`}>User Id</h6>

                <p
                  className={`copy ${s.text}`}
                  onClick={() => {
                    copy(userData._id);
                  }}
                >
                  {userData._id}
                </p>
              </div>
            </div>

            {/* // ? input поля */}
            <div className={`${s.fields} ${s.fields_type_horizontal}`}>
              {/* // ? name */}
              <Input
                name={'Name'}
                id='name'
                placeholder={'John'}
                minLength={VALIDATION.NAME.MIN}
                maxLength={VALIDATION.NAME.MAX}
                customRef={nameRef}
                onChange={handleFieldChange}
                isValid={validatedFields.name.valid}
                textError={validatedFields.name.error}
              ></Input>

              {/* // ? second name */}
              <Input
                name={'Second Name'}
                id='secondName'
                placeholder={'Stone'}
                minLength={VALIDATION.NAME.MIN}
                maxLength={VALIDATION.NAME.MAX}
                customRef={secondNameRef}
                onChange={handleFieldChange}
                isValid={validatedFields.secondName.valid}
                textError={validatedFields.secondName.error}
              ></Input>
            </div>

            {/* // ? input поля */}
            <div className={`${s.fields} ${s.fields_type_horizontal}`}>
              {/* // ? phone */}
              <Input
                name={'Phone number'}
                id='phone'
                type='tel'
                pattern='^\+\d{1,3}\d{5,}$'
                placeholder={'+491234567890'}
                customRef={phoneRef}
                onChange={handleFieldChange}
                isValid={validatedFields.phone.valid}
                textError={validatedFields.phone.error}
              ></Input>

              <button
                className={`button ${s.button} ${s.button_type_company}`}
                type='button'
                onClick={() => {
                  if (!!userData.companyId) {
                    window.location.href = paths.company.profile.replace(
                      ':companyId',
                      userData.companyId,
                    );
                  } else {
                    window.location.href = paths.company.create;
                  }
                }}
              >
                {!!userData.companyId
                  ? 'Change company data'
                  : 'Add info about company'}
              </button>
            </div>

            {/* // ? files */}
            {isFilesDownloaded && (
              <div
                className={`${s.infos} ${s.infos_type_documents} ${s.infos_border_top}`}
              >
                {/* // ? Passport */}
                <File
                  handleDelete={deleteFileOnServer}
                  handleSubmit={uploadFileToServer}
                  openFile={openFile}
                  isActive={userData.passport && !!userData.passport.url}
                  title={'Passport'}
                  icon={{
                    url: userData.passport && userData.passport.url,
                    alt: 'passport',
                  }}
                  typeOfFile={'passport'}
                  expansionOfFile={userData.passport && userData.passport.type}
                />

                {/* // ? proof of Address */}
                <File
                  handleDelete={deleteFileOnServer}
                  handleSubmit={uploadFileToServer}
                  openFile={openFile}
                  isActive={
                    userData.proofOfAddress && !!userData.proofOfAddress.url
                  }
                  title={'Proof of address'}
                  icon={{
                    url: userData.proofOfAddress && userData.proofOfAddress.url,
                    alt: 'Proof of address',
                  }}
                  typeOfFile={'proofOfAddress'}
                  expansionOfFile={
                    userData.proofOfAddress && userData.proofOfAddress.type
                  }
                />

                {/* // ? Selfie With ID Or Passport */}
                <File
                  handleDelete={deleteFileOnServer}
                  handleSubmit={uploadFileToServer}
                  openFile={openFile}
                  isActive={
                    userData.selfieWithIDOrPassport &&
                    !!userData.selfieWithIDOrPassport.url
                  }
                  title={'Selfie with id'}
                  icon={{
                    url:
                      userData.selfieWithIDOrPassport &&
                      userData.selfieWithIDOrPassport.url,
                    alt: 'Selfie with id',
                  }}
                  typeOfFile={'selfieWithIDOrPassport'}
                  expansionOfFile={
                    userData.selfieWithIDOrPassport &&
                    userData.selfieWithIDOrPassport.type
                  }
                />
              </div>
            )}

            {/* // ? кнопка submit */}
            {hasFormAnotherData && (
              <button
                disabled={!isFormValid}
                className={`button ${s.button} ${s.button_type_submit}`}
                type='submit'
              >
                {currentTextSubmitButton}
              </button>
            )}
          </form>
        </article>
      </section>
      {currenFile && isPopupOpen && (
        <Popup
          closePopup={() => {
            setPopupOpen(false);
          }}
          title={currenFile.title}
          file={{
            src: currenFile.src,
            alt: currenFile.alt,
            type: currenFile.type,
          }}
        />
      )}

      <SumsubWebSdk
        accessToken={accessToken}
        expirationHandler={
          async () => {
            const externalUserId =
              'random-JSToken-' + Math.random().toString(36).substr(2, 9);
            return await axios(createAccessToken(externalUserId));

            // return Promise.resolve(response);
          } /* accessTokenExpirationHandler */
        }
        // config={config}
        // options={options}
        // onMessage={messageHandler}
        // onError={errorHandler}
      />
    </>
  );
}

export default Profile;
