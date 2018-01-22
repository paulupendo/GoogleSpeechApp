import {authHeader} from '../helpers';

export const studyService = {
    getAll,
    
};

function getAll(token) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    var user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        token = user.token;
        console.log("token: " + token);
    } else {
        console.warn("failed to get token !~~");
    }

    var url = 'http://52.230.8.132:8080/api/get_study_material?token='+token;

    return fetch(url, requestOptions)
        .then(function(response) {
            if (!response.ok) {
                return Promise.reject(response.statusText);
            }   
            return response.json();
        })
        .then(function(resp) {
            //console.log("study.service :: handleStudiesResponse(), resp: " + JSON.stringify(resp) );
            return resp;
        });
}