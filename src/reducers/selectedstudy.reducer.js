import {studyConstants} from '../constants';

export function selectedStudy(state = null, action) {
    switch (action.type) {
        case studyConstants.STUDY_SELECTED:
            return action.payload;
            break;
    }
    return state;
}