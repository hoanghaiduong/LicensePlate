
export interface UserObject {
    userID: string;
    password: string;
    org: string;
    timeStamp: string;
}

interface UserObjectWithTimestamp extends UserObject {
    timeStamp: string; // adjust the type accordingly
}
