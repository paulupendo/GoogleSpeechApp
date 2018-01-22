import {studyConstants} from '../constants';
import {studyService} from '../services';



export const studyActions = {
  getAll,
  selectedStudy
};

// 
//------------------- Request API --------------------
//

function getAll(history) {
  return (dispatch) => {
    dispatch(requestAll());

    studyService.getAll()
            .then(
                (studies) => {
                  //console.log("study actions dispatching studies: " + studies);

                  if(!studies.studies) {

                      // FIXME - remote this ugly code later
                     if(studies.message == "Invalid token!") {
                        console.log("--- token expired, should redirect to login...");
                        localStorage.removeItem('user');
                        history.push("/login");
                     }
                  }

                  dispatch(success(studies.studies));
                },

                (error) => {
                  console.log("study actions dispatching error: " + error);
                  dispatch(failure(error));
                }
            )
            .catch(function(error){
              console.log("study actions -> getAll got error: " + error);
            }); 
  };
  function requestAll() {
    return {type: studyConstants.GETALL_REQUEST};
  }
   function success(studies) {
    //console.log("---> success for studies: " + studies);

    return {type: studyConstants.GETALL_SUCCESS, studies};
  }
  function failure(error) {
    return {type: studyConstants.GETALL_FAILURE, error};
  }
}


function selectedStudy(key){
    console.log("++++ study actions, selectedStudy() key: ", key);
    return {
        type: studyConstants.STUDY_SELECTED,
        payload: key
    }
}