import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

let dynamicNodeUrl = "https://valvar-jacquelin-gradualistic.ngrok-free.dev";
let dynamicPyUrl = "https://valvar-jacquelin-gradualistic.ngrok-free.dev";

export const getApiUrl = () => dynamicNodeUrl;
export const getPyUrl = () => dynamicPyUrl;

export const setApiUrls = async (nodeUrl: string, pyUrl: string) => {
  dynamicNodeUrl = nodeUrl;
  dynamicPyUrl = pyUrl;
  await AsyncStorage.setItem('nodeUrl', nodeUrl);
  await AsyncStorage.setItem('pyUrl', pyUrl);
  
  nodeApi.defaults.baseURL = nodeUrl;
  pythonApi.defaults.baseURL = pyUrl;
};

export const loadSavedUrls = async () => {
  const savedNode = await AsyncStorage.getItem('nodeUrl');
  const savedPy = await AsyncStorage.getItem('pyUrl');
  if (savedNode) {
    dynamicNodeUrl = savedNode;
    nodeApi.defaults.baseURL = savedNode;
  }
  if (savedPy) {
    dynamicPyUrl = savedPy;
    pythonApi.defaults.baseURL = savedPy;
  }
};

export const nodeApi = axios.create({
  baseURL: dynamicNodeUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

export const pythonApi = axios.create({
  baseURL: dynamicPyUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

loadSavedUrls();
