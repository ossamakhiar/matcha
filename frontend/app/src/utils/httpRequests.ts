import { getCookie } from "./generalPurpose";

export async function sendActionRequest(method: string, url: string, data: any, token?: string) {
    const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(data)
    });

    let responseBody: any;

    try {
        responseBody = await response.json();        
    } catch (err) {
        responseBody = null;
    }

    if (!response.ok) {
        throw (responseBody?.error ?? responseBody ?? 'uknown error occurred');
    }

    return (responseBody);
}

export async function sendFormDataRequest(method: string, url: string, formData: FormData) {
    const csrfClientExposedCookie = getCookie('csrfClientExposedCookie');

    const headers: { [key: string]: string } = {
        'Authorization': `Bearer ${csrfClientExposedCookie}`
    }

    const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: headers,
        body: formData
    });

    let responseBody: any;

    try {
        responseBody = await response.json();        
    } catch (err) {
        responseBody = null;
    }

    if (response.status === 401) {
        document.location.href = import.meta.env.VITE_LOCAL_FRONTEND_LOGIN_URL;
    }

    if (response.status === 403 && responseBody.url) {
        document.location.href = responseBody.url;
    }

    if (!response.ok) {
        throw (responseBody?.error ?? responseBody ?? 'uknown error occurred');
    }

    return (responseBody);
}

// loosely typed for now
export async function sendLoggedInActionRequest(method: string, url: string, data?: any, contentType?: string) {
    const csrfClientExposedCookie = getCookie('csrfClientExposedCookie');

    const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${csrfClientExposedCookie}`
    }

    let body = null;

    if (data) {
        body = JSON.stringify(data);
    }

    if (contentType) {
        headers['Content-Type'] = contentType;
    }

    const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: headers,
        body
    });

    let responseBody: any;

    try {
        responseBody = await response.json();        
    } catch (err) {
        responseBody = null;
    }

    if (response.status === 401) {
        document.location.href = import.meta.env.VITE_LOCAL_FRONTEND_LOGIN_URL;
    }

    if (response.status === 403 && responseBody.url) {
        document.location.href = responseBody.url;
    }

    if (!response.ok) {
        throw (responseBody?.error ?? responseBody ?? 'uknown error occurred');
    }

    return (responseBody);
}

export async function sendLoggedInGetRequest(url: string) {
    const csrfClientExposedCookie = getCookie('csrfClientExposedCookie');

    const response = await fetch(url, {
        method: "GET",
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${csrfClientExposedCookie}`
        },
    });

    let responseBody: any;

    try {
        responseBody = await response.json();
    } catch (err) {
        responseBody = null;
    }

    if (response.status === 401) {
        document.location.href = import.meta.env.VITE_LOCAL_FRONTEND_LOGIN_URL;
    }

    if (response.status === 403 && responseBody.url) {
        document.location.href = responseBody.url;
    }

    if (!response.ok) {
        throw (responseBody?.error ?? responseBody ?? 'uknown error occurred');
    }

    return (responseBody);
}


export async function sendGetRequest(url: string) {
    const response = await fetch(url, {
        method: "GET",
        credentials: 'include',
    });

    let responseBody: any;

    try {
        responseBody = await response.json();
    } catch (err) {
        responseBody = null;
    }

    if (response.status === 401) {
        document.location.href = import.meta.env.VITE_LOCAL_FRONTEND_LOGIN_URL;
    }

    if (response.status === 403 && responseBody.url) {
        document.location.href = responseBody.url;
    }

    if (!response.ok) {
        throw (responseBody?.error ?? responseBody ?? 'uknown error occurred');
    }

    return (responseBody);
}

