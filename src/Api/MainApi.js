// ? constants
import { STATUS, SETTINGS_API } from './../utils/constants';

class MainApi {
  constructor(setting) {
    this._address = setting.baseUrl;
    this._credentials = setting.credentials;
    this._headers = setting.headers;
  }

  // проверка ответа от сервера
  _checkResponse(res, url, message = '', type) {
    // тут проверка ответа
    if (res.ok) {
      // во время dev выводим в консоль
      if (STATUS.DEV)
        console.log(
          `The request to server [${url}]${
            message && ` for [${message}]`
          } was successfully processed`,
        );

      if (type === 'json') return res.json();
      return res;
    }

    // // ? ошибки
    // // 429 лимит запросов
    // if (res.status === 429) {
    //   const err = {
    //     message: res.statusText,
    //     status: 429,
    //   };
    //   // возвращаем ошибку
    //   return Promise.reject(err);
    // }

    // остальные ошибки
    const error = res.json();
    return error.then((errorObj) =>
      Promise.reject({
        message: errorObj.message,
        status: res.status,
      }),
    );
  }

  // запрос на сервер
  async _request(url, options, message, type = 'json') {
    const res = await fetch(url, options);
    return this._checkResponse(res, url, message, type);
  }

  // ? GET

  // получение информации о пользователе
  getUserInfo() {
    return this._request(
      `${this._address}/user/me`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: this._headers,
      },
      'get user info',
    );
  }

  // получение информации о пользователях
  getUsersInfo() {
    return this._request(
      `${this._address}/admin/users`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: this._headers,
      },
      'get users info',
    );
  }

  /* получение информации о пользователе по его id
    userId = 655608239736cf4d57ee5299
  */
  getUserInfoById(userId) {
    return this._request(
      `${this._address}/admin/users/${userId}`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: this._headers,
      },
      'get user info',
    );
  }

  /* получение информации о компании по её id
    companyId = 655608239736cf4d57ee5299
  */
  getCompanyInfoById(companyId) {
    return this._request(
      `${this._address}/company/${companyId}`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: this._headers,
      },
      'get company info',
    );
  }

  // получение файла пользователя
  getUserFile(data) {
    const _headers = this._headers;

    _headers['Content-Type'] = data['Content-Type'];

    return this._request(
      `${this._address}/user/me/file/${data.typeOfFile}`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: _headers,
      },
      `get user file ${data.typeOfFile}`,
      data.typeOfFile,
    );
  }

  /* получение файла пользователя по его id
    data = {
      'Content-Type': // ? тип файла
      typeOfFile: '' // ? тип файла
    },
    userId = 655608239736cf4d57ee5299
  */
  getUserFileById(data, userId) {
    const _headers = this._headers;

    _headers['Content-Type'] = data['Content-Type'];

    return this._request(
      `${this._address}/admin/users/${userId}/file/${data.typeOfFile}`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: _headers,
      },
      `get user file ${data.typeOfFile}`,
      data.typeOfFile,
    );
  }

  /* получение файла пользователя по его id
    companyId = 655608239736cf4d57ee5299
  */
  getCompanyFileById(data, companyId) {
    const _headers = this._headers;

    _headers['Content-Type'] = data['Content-Type'];

    return this._request(
      `${this._address}/company/${companyId}/file/${data.typeOfFile}`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: _headers,
      },
      `get company file ${data.typeOfFile}`,
      data.typeOfFile,
    );
  }

  /* получение файла акционера по его id
    companyId = 655608239736cf4d57ee5299
    shareholderId = 655608239736cf4d57ee5299
  */
  getShareholderFileByIdCompanyById(data, companyId, shareholderId) {
    const _headers = this._headers;

    _headers['Content-Type'] = data['Content-Type'];

    return this._request(
      `${this._address}/company/${companyId}/shareholder/${shareholderId}/file/${data.typeOfFile}`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: _headers,
      },
      `get shareholder file ${data.typeOfFile}`,
      data.typeOfFile,
    );
  }

  /* получение данных акционера по его id
    companyId = 655608239736cf4d57ee5299
    shareholderId = 655608239736cf4d57ee5299
    */
  getShareholderByIdCompanyById(companyId, shareholderId) {
    return this._request(
      `${this._address}/company/${companyId}/shareholder/${shareholderId}`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: this._headers,
      },
      `get data of shareholder [${shareholderId}]`,
    );
  }

  // получение информации о администраторе
  getAdminInfo() {
    return this._request(
      `${this._address}/admin/me`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: this._headers,
      },
      'get admin info',
    );
  }

  /* получение файла пользователя по его id
    userId = 655608239736cf4d57ee5299
  */
  getPrice(ids = 'all', vs_currencies = 'all') {
    return this._request(
      `${this._address}/price/${ids}/${vs_currencies}`,
      {
        method: 'GET',
        credentials: this._credentials,
        headers: this._headers,
      },
      `get price of currencies`,
    );
  }

  // ? POST

  /* авторизация пользователя
    user = {
      email: "test@gmail.com",
      password: "test_password_1"
    }
  */
  authorization(user) {
    return this._request(
      `${this._address}/auth/signin`,
      {
        method: 'POST',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify(user),
      },
      'authentication',
    );
  }

  // первичная регистрация пользователя с отправкой проверочного кода на почту
  signup(user) {
    return this._request(
      `${this._address}/auth/signup`,
      {
        method: 'POST',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify(user),
      },
      'registration',
    );
  }

  /* проверка почты через проверочный код и последующая, окончательная регистрация пользователя
    user = {
      email: "test@gmail.com",
      code: "FD4BY9"
    }
  */
  verifyEmail(user) {
    return this._request(
      `${this._address}/auth/verifyAndSignup`,
      {
        method: 'POST',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify(user),
      },
      'registration',
    );
  }

  // login admin
  loginAdmin(admin) {
    return this._request(
      `${this._address}/auth/login`,
      {
        method: 'POST',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify(admin),
      },
      'authentication admin',
    );
  }

  /* создание нового администратора
    admin = {
      login: "login",
      email: "email@email.com", // not required
      password: "test_password_1"
    }
  */
  createAdmin(admin) {
    return this._request(
      `${this._address}/admin/createOneAdmin`,
      {
        method: 'POST',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify(admin),
      },
      'create admin',
    );
  }

  /* отправка сообщения в поддержку
    mail = {
      title: "title" // заглавие
      message: "message" // сообщение в поддержку
    }
  */
  sendMailToSupport(mail) {
    return this._request(
      `${this._address}/support/mail`,
      {
        method: 'POST',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify({
          title: mail.title,
          message: mail.message,
        }),
      },
      'send mail to support',
    );
  }

  /* отправка сообщения для связи с владельцами сайта
    mail = {
      name: "name",
      email: "email",
      message: "message"
    }
  */
  sendMailToCommunicate(mail) {
    return this._request(
      `${this._address}/support/mailToCommunicate`,
      {
        method: 'POST',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify({
          name: mail.name,
          email: mail.email,
          message: mail.message,
        }),
      },
      'send mail to communicate',
    );
  }

  /* создание компании
    company = {
      "registrationNumber": "test_registration_number_2",
      "shareholder": {
        "typeOfShareholder": "company",
        "data": {
          "registrationNumber": "test_registration_number"
        }
    }
  */
  createCompany(company) {
    return this._request(
      `${this._address}/company`,
      {
        method: 'POST',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify(company),
      },
      'create company',
    );
  }

  /* создание акционера
    shareholder = {
      "typeOfShareholder": "company",
      "percentageOfOwnership": 0 // ? 0 - 100
      "shareholder": {
        "typeOfShareholder": "company",
        "data": {
          "registrationNumber": "test_registration_number"
        }
    }
  */
  createShareholderCompanyById(companyId, shareholder) {
    const _headers = this._headers;

    _headers['Content-Type'] = SETTINGS_API.contentType;
    return this._request(
      `${this._address}/company/${companyId}/shareholder`,
      {
        method: 'POST',
        credentials: this._credentials,
        headers: _headers,
        body: JSON.stringify(shareholder),
      },
      'create shareholder',
    );
  }

  // ? PUT

  /* положить файл пользователю
    data = {
      typeOfFile: "passport"
      file: // ? file
    }
   */
  putUserFile(data) {
    return this._request(
      `${this._address}/user/me/file/${data.typeOfFile}`,
      {
        method: 'PUT',
        credentials: this._credentials,
        body: data.file,
      },
      `put user file ${data.typeOfFile}`,
    );
  }

  /* положить файл пользователю по его Id
    data = {
      userId: 655608239736cf4d57ee5299,
      typeOfFile: "passport"
      file: // ? file
    }
   */
  putUserFileById(data) {
    return this._request(
      `${this._address}/admin/users/${data.userId}/file/${data.typeOfFile}`,
      {
        method: 'PUT',
        credentials: this._credentials,
        body: data.file,
      },
      `put user file ${data.typeOfFile}`,
    );
  }

  /* положить файл компании по его Id
    data = {
      typeOfFile: "passport"
      file: // ? file
    },
    companyId: 655608239736cf4d57ee5299,
   */
  putCompanyFileById(data, companyId) {
    return this._request(
      `${this._address}/company/${companyId}/file/${data.typeOfFile}`,
      {
        method: 'PUT',
        credentials: this._credentials,
        body: data.file,
      },
      `put company file ${data.typeOfFile}`,
    );
  }

  /* положить файл акционера по его Id
    data = {
      typeOfFile: "passport"
      file: // ? file
    },
    companyId: 655608239736cf4d57ee5299,
    shareholderId: 655608239736cf4d57ee5299,
  */
  putShareholderFileByIdCompanyById(data, companyId, shareholderId) {
    return this._request(
      `${this._address}/company/${companyId}/shareholder/${shareholderId}/file/${data.typeOfFile}`,
      {
        method: 'PUT',
        credentials: this._credentials,
        body: data.file,
      },
      `put shareholder file ${data.typeOfFile}`,
    );
  }

  // ? PATCH

  /* обновление данных пользователя
    user = {
      name: "new name"
    }
  */
  updateUserData(user) {
    let _headers = this._headers;
    _headers['Content-Type'] = SETTINGS_API.contentType;
    return this._request(
      `${this._address}/user/me`,
      {
        method: 'PATCH',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify(user),
      },
      'update user data',
    );
  }

  /* обновление данных пользователя
    user = {
      name: "new name"
    },
    userId = 655608239736cf4d57ee5299
  */
  updateUserDataById(user, userId) {
    let _headers = this._headers;
    _headers['Content-Type'] = SETTINGS_API.contentType;
    return this._request(
      `${this._address}/admin/users/${userId}`,
      {
        method: 'PATCH',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify(user),
      },
      'update user data',
    );
  }

  /* обновление данных компании
    company = {
      name: "new name"
    },
    companyId = 655608239736cf4d57ee5299
  */
  updateCompanyDataById(company, companyId) {
    let _headers = this._headers;
    _headers['Content-Type'] = SETTINGS_API.contentType;
    return this._request(
      `${this._address}/company/${companyId}`,
      {
        method: 'PATCH',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify(company),
      },
      'update company data',
    );
  }

  /* обновление данных акционера
    shareholder = {
      name: "new name"
    },
    companyId = 655608239736cf4d57ee5299
  */
  updateShareholderByIdCompanyById(shareholder, companyId, shareholderId) {
    let _headers = this._headers;
    _headers['Content-Type'] = SETTINGS_API.contentType;
    return this._request(
      `${this._address}/company/${companyId}/shareholder/${shareholderId}`,
      {
        method: 'PATCH',
        credentials: this._credentials,
        headers: this._headers,
        body: JSON.stringify(shareholder),
      },
      'update company data',
    );
  }

  // ? DELETE

  /* удаление файла пользователя
    typeOfFile = 'passport' // ? тип файла
   */
  deleteUserFile(typeOfFile) {
    return this._request(
      `${this._address}/user/me/file/${typeOfFile}`,
      {
        method: 'DELETE',
        credentials: this._credentials,
        headers: this._headers,
      },
      `delete user file ${typeOfFile}`,
    );
  }

  /* удаление файла пользователя по его id
    typeOfFile = 'passport' // ? тип файла
    userId = 655608239736cf4d57ee5299
   */
  deleteUserFileById(typeOfFile, userId) {
    return this._request(
      `${this._address}/admin/users/${userId}/file/${typeOfFile}`,
      {
        method: 'DELETE',
        credentials: this._credentials,
        headers: this._headers,
      },
      `delete user file ${typeOfFile}`,
    );
  }

  /* удаление файла компании по её id
    typeOfFile = 'certificateOfIncorporation' // ? тип файла
    companyId = 655608239736cf4d57ee5299
   */
  deleteCompanyFileById(typeOfFile, companyId) {
    return this._request(
      `${this._address}/company/${companyId}/file/${typeOfFile}`,
      {
        method: 'DELETE',
        credentials: this._credentials,
        headers: this._headers,
      },
      `delete company file ${typeOfFile}`,
    );
  }

  /* удаление компании по её id
    companyId = 655608239736cf4d57ee5299
   */
  deleteCompanyById(companyId) {
    return this._request(
      `${this._address}/company/${companyId}`,
      {
        method: 'DELETE',
        credentials: this._credentials,
        headers: this._headers,
      },
      `delete company`,
    );
  }

  /* удаление акционера компании по его id и id компании
    companyId = 655608239736cf4d57ee5299
    shareholderId = 655608239736cf4d57ee5299
  */
  deleteShareholderByIdCompanyById(companyId, shareholderId) {
    return this._request(
      `${this._address}/company/${companyId}/shareholder/${shareholderId}`,
      {
        method: 'DELETE',
        credentials: this._credentials,
        headers: this._headers,
      },
      `delete shareholder [${shareholderId}]`,
    );
  }

  // выход из системы
  logOut() {
    return this._request(
      `${this._address}/auth/signout`,
      {
        method: 'DELETE',
        credentials: this._credentials,
        headers: this._headers,
      },
      'Log out',
    );
  }
}

// настройки для api
const setting = {
  baseUrl: SETTINGS_API.baseURL,
  credentials: SETTINGS_API.credentials,
  headers: {
    origin: SETTINGS_API.baseURL,
    'Content-Type': SETTINGS_API.contentType,
  },
};

const mainApi = new MainApi(setting);
export default mainApi;
