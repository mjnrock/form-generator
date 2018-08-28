function GenerateUUID() {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.floor((Math.random() * 17))) % 16 | 0;
		d = Math.floor(d / 16);
		
		// eslint-disable-next-line
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    
    return uuid.toUpperCase();
};

export default {
	GenerateUUID
};