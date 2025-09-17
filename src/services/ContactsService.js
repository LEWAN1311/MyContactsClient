import AxiosInstance from "../api/AxiosInstance";

const ContactsService = {
    getContacts: async () => {
        const response = await AxiosInstance.get('/contacts');
        return response.data;
    },

    create: async (contactData) => {
        const response = await AxiosInstance.post('/contacts', contactData);
        return response.data;
    },

    update: async (id, contactData) => {
        const response = await AxiosInstance.patch(`/contacts/${id}`, contactData);
        return response.data;
    },

    delete: async (id) => {
        const response = await AxiosInstance.delete(`/contacts/${id}`);
        return response.data;
    },
}

export default ContactsService;