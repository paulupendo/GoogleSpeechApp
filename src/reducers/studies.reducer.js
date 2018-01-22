import {studyConstants} from '../constants';

export function studies(state = {},action) {
  switch (action.type) {
    
    case studyConstants.GETALL_REQUEST:
      return {
        
       
      };
    case studyConstants.GETALL_SUCCESS:

      console.log("studies reducer got studies:" +action.studies);
      return action.studies;

    case  studyConstants.GETALL_FAILURE:
      return {
        error: action.error,
      };

    
    default:
      return state;
  }
}
