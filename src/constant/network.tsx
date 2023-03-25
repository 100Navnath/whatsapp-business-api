import axios from 'axios';

import { Observable } from 'rxjs';
import { apiList } from './apiList';
import Toast from '../components/Toast/Toast';
import { getFromLocalStorage } from '../components/LocalStorage/localStorage';

/**
 * Fetching refresh token
 * 
 * @param {any} parms 
 * @returns 
 */

const getRefeshToken = async (parms: any) => {
    const userInfo = await getFromLocalStorage("user");
    const { ReferehToken, AppToken } = userInfo;
    return parms === 'AppToken' ? AppToken : ReferehToken;
}

const getToken = async () => {
    const userInfo = await getFromLocalStorage("user");
    const jwt = userInfo && userInfo.jwt ? userInfo.jwt.token : undefined
    return jwt
}

/**
 * Http post request
 * 
 * @param {string} url 
 * @param {{}} params 
 * @param {{}} [headers] 
 * @returns 
 */
const post = (url: string, params: {}, headers?: {}) => {
    try {
        console.log("Inside post req : ", url, params, headers);
        return new Observable((observer: any) => {
            getToken().then((token) => {
                const _headers = {
                    headers: { ...headers, "Authorization": `${token}` }
                }
                axios.post(url, params, _headers)
                    .then((response) => {
                        console.log("response : ", response);
                        observer.next(response);
                        observer.complete();
                    })
                    .catch((error) => {
                        console.log(error);
                        if (error.response.data && error.response.data.pendingDetails && error.response.data.pendingDetails.length > 0) {
                            for (let i = 0; i < error.response.data.pendingDetails.length; i++) {
                                Toast({ message: `${error.response.data.pendingDetails[i].message}`, type: "error" })
                            }
                        }
                        else if (error.response.data && error.response.data.message) {
                            Toast({ message: error.response.data.message, type: 'error' })
                        }
                        else if (error.message) {
                            Toast({ message: error.message, type: 'error' })
                        }
                        else Toast({ message: `Something went wrong with status ${error.response.status}`, type: 'error' })
                        if (error && error.response && error.response.status === 401) {
                            refreshToken('post', url, params)?.subscribe({
                                next(res) {
                                    observer.next(res);
                                    observer.complete();
                                },
                                error(err) {
                                    observer.error(err);
                                    observer.complete();
                                },
                            })
                        } else {
                            observer.error(error);
                            observer.complete();
                        }
                    }
                    )
            })
        })
    } catch (err) {
        // console.log('catch err', err)
    }
};

/**
 * Http put request
 * 
 * @param {string} url 
 * @param {{}} params 
 * @param {{}} [headers] 
 * @returns 
 */
const put = (url: string, params: {}, headers?: {}) => {
    try {
        return new Observable((observer: any) => {
            getToken().then((token) => {
                const _headers = {
                    headers: { ...headers, "Authorization": `${token}` }
                }
                console.log("Inside put req : ", url, params, _headers);
                axios.put(url, params, _headers)
                    .then((response) => {
                        console.log("response of url : ", url, " ", response);

                        observer.next(response);
                        observer.complete();
                    })
                    .catch((error) => {
                        console.log(error);
                        if (error.response.data.pendingDetails && error.response.data.pendingDetails.length > 0) {
                            for (let i = 0; i < error.response.data.pendingDetails.length; i++) {
                                Toast({ message: `${error.response.data.pendingDetails[i].message}`, type: "error" })
                            }
                        }
                        else if (error.response.data && error.response.data.message) {
                            Toast({ message: error.response.data.message, type: 'error' })
                        }
                        if (error && error.response && error.response.status === 401) {
                            refreshToken('put', url, params)?.subscribe({
                                next(res) {
                                    observer.next(res);
                                    observer.complete();
                                },
                                error(err) {
                                    observer.error(err);
                                    observer.complete();
                                },
                            })
                        } else {
                            observer.error(error);
                            observer.complete();
                        }
                    }
                    )
            });
        });
    } catch (err) {
        // console.log('catch err', err)
    }
}

/**
 * Http get request
 * 
 * @param {string} url 
 * @param {{}} params 
 * @param {{}} [headers] 
 * @param {*} [cancelToken] 
 * @returns 
 */

const get = (url: string, params: {}, headers?: {}, cancelToken?: any) => {
    try {
        return new Observable((observer: any) => {
            getToken().then((token) => {
                console.log("GET req => url : ", url, "params : ", params, "headers : ", { ...headers, Authorization: token });
                const _params = cancelToken ? { params: params, headers: { ...headers, Authorization: token }, cancelToken: cancelToken } : { params: params, headers: { ...headers, Authorization: token } };
                axios.get(url, _params,)
                    .then((response) => {
                        console.log("response of ", url, " : ", response);
                        observer.next(response);
                        observer.complete();
                    })
                    .catch((error) => {
                        console.log("response of ", url, " : ", error);
                        if (error.response.data && error.response.data.message) {
                            Toast({ message: error.response.data.message, type: 'error' })
                        }
                        if (error && error.response && error.response.status === 401) {
                            refreshToken('get', url, params)?.subscribe({
                                next(res: any) {
                                    observer.next(res);
                                    observer.complete();
                                },
                                error(err: any) {
                                    observer.error(err);
                                    observer.complete();
                                },
                            })
                        } else {
                            observer.error(error);
                            observer.complete();
                        }
                    }
                    )
            });
        });
    } catch (err: any) {
        console.log('catch err', err);
        Toast({ message: err, type: 'error' })
    }
}
/**
 * Check whether session is alive or not
 * 
 * @param {string} url 
 * @param {{}} params 
 * @param {{}} [headers] 
 * @param {*} [cancelToken] 
 * @returns 
 */
const getisalive = (url: string, params: {}, headers?: {}, cancelToken?: any) => {
    try {

        return new Observable((observer: any) => {
            const _params = cancelToken ? { params: params, headers, cancelToken: cancelToken } : { params: params, headers };

            axios.get(url, _params,)
                .then((response) => {
                    // console.log("getisalive",response)
                    observer.next(response);
                    observer.complete();
                })
                .catch((error) => {
                    // console.log("error getisalive",error)
                    if (error && error.response && error.response.status === 401) {
                        refreshTokenisalive('get', url, params)?.subscribe({
                            next(res) {
                                observer.next(res);
                                observer.complete();
                            },
                            error(err) {
                                observer.error(err);
                                observer.complete();
                            }
                        })
                    } else {
                        observer.error(error);
                        observer.complete();
                    }
                }
                )
        });
    } catch (err) {
        // console.log('catch err', err)
    }
}
/**
 * Http delete request
 * 
 * @param {string} url 
 * @param {{}} params 
 * @param {{}} [headers] 
 * @returns 
 */
const deleteApi = (url: string, params: {}, headers?: {}) => {
    try {
        return new Observable((observer: any) => {
            getToken().then((token) => {
                console.log("Delete req => url : ", url, "params : ", params, "headers : ", { headers: { ...headers, Authorization: token } });
                axios.delete(url, { params, headers: { ...headers, Authorization: token } })
                    .then((response: any) => {
                        console.log("response of ", url, " : ", response);
                        observer.next(response);
                        observer.complete();
                    }).catch((error) => {
                        if (error.response.data && error.response.data.message) {
                            Toast({ message: error.response.data.message, type: 'error' })
                        }
                        if (error && error.response && error.response.status === 401) {
                            refreshToken('delete', url, params)?.subscribe({
                                next(res) {
                                    observer.next(res);
                                    observer.complete();
                                },
                                error(err) {
                                    observer.error(err);
                                    observer.complete();
                                }
                            })
                        } else {
                            observer.error(error);
                            observer.complete();
                        }
                    }
                    )
            });
        });
    } catch (err) {
        // console.log('catch err', err)
    }
}
/**
 * Check refresh token is valid or not
 * 
 * @param {any} requestType 
 * @param {any} requestUrl 
 * @param {any} headers 
 * @returns 
 */
const refreshTokenisalive = (requestType: any, requestUrl: any, headers: any) => {
    let AppToken;
    try {
        const url = process.env.REACT_APP_API_END_POINT + apiList.refreshToken;
        let ReferehToken: any;
        return new Observable((observer: any) => {
            getRefeshToken('ReferehToken').then((res) => {
                ReferehToken = res;
            }).then(() => {
                axios.post(url, '', {
                    headers: {
                        Authorization: ReferehToken
                    }
                })
                    .then((response) => {
                        // console.log("refresh toen api",response)
                        localStorage.setItem('chatData', JSON.stringify(response.data));
                        // Set login time
                        const loginTime = new Date().valueOf();
                        localStorage.setItem('loginTime', JSON.stringify(loginTime))
                        const params = {
                            'ApiKey': process.env.REACT_APP_API_KEY,
                            'SecreteKey': process.env.REACT_APP_SECRET_KEY,
                            'Authorization': 'Bearer ' + response.data.AppToken,
                            'content-type': 'application/json;charset=UTF-8'
                        }
                        //   console.log("refresh token api headers",headers)
                        getisalive(requestUrl, '', params)?.subscribe({
                            next(res) {
                                // console.log('refresh token',res)
                                observer.next(res);
                                observer.complete();
                            },
                            error(err) {
                                // console.log('refresh token err',err)
                                err && err.response ? observer.error(err.response) : observer.error(err);
                                observer.complete();
                            }
                        });
                    })
                    .catch((error) => {
                        observer.error("refresh token error", error);
                        observer.complete();
                        // logout();
                    });
            })
        })
    } catch (err) {
        // console.log('catch error')
    }
}

/**
 * Get refresh token
 * 
 * @param {any} requestType 
 * @param {any} requestUrl 
 * @param {any} params 
 * @returns 
 */
const refreshToken = (requestType: any, requestUrl: any, params: any) => {
    let AppToken;
    try {
        const url = process.env.REACT_APP_API_END_POINT + apiList.refreshToken;
        let ReferehToken: any;
        return new Observable((observer: any) => {
            getRefeshToken('ReferehToken').then((res) => {
                ReferehToken = res;
            }).then(() => {
                axios.post(url, '', {
                    headers: {
                        Authorization: ReferehToken
                    }
                })
                    .then((response) => {
                        localStorage.setItem('chatData', JSON.stringify(response.data));
                        // Set login time
                        const loginTime = new Date().valueOf();
                        localStorage.setItem('loginTime', JSON.stringify(loginTime))
                        const headers = {
                            'Authorization': 'Bearer ' + response.data.AppToken,
                            'content-type': 'application/json;charset=UTF-8'
                        }
                        switch (requestType) {
                            case 'get':
                                get(requestUrl, params, headers)?.subscribe({
                                    next(res) {
                                        observer.next(res);
                                        observer.complete();
                                    },
                                    error(err) {
                                        err && err.response ? observer.error(err.response) : observer.error(err);
                                        observer.complete();
                                    }
                                });
                                break;

                            case 'post':

                                post(requestUrl, params, { headers: headers })?.subscribe(
                                    res => {
                                        observer.next(res);
                                        observer.complete();
                                    }, err => {
                                        err && err.response ? observer.error(err.response) : observer.error(err);
                                        observer.complete();
                                    }
                                );
                                break;
                            case 'put':
                                put(requestUrl, params, { headers: headers })?.subscribe(
                                    res => {
                                        observer.next(res);
                                        observer.complete();
                                    }, err => {
                                        err && err.response ? observer.error(err.response) : observer.error(err);
                                        observer.complete();
                                    }
                                );
                                break;
                            case 'delete':
                                deleteApi(requestUrl, { params, headers })?.subscribe(
                                    res => {
                                        observer.next(res);
                                        observer.complete();
                                    }, err => {
                                        err && err.response ? observer.error(err.response) : observer.error(err);
                                        observer.complete();
                                    }
                                );
                                break;
                        }
                    })
                    .catch((error) => {
                        observer.error(error);
                        observer.complete();
                        // logout();
                    });
            })
        })
    } catch (err) {
        // console.log('catch error')
    }
}

export const API = {
    post,
    get,
    put,
    deleteApi,
    getisalive
};
