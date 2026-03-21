import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

let dynamicNodeUrl = "https://valvar-jacquelin-gradualistic.ngrok-free.dev";
let dynamicPyUrl = "https://valvar-jacquelin-gradualistic.ngrok-free.dev";

export const getApiUrl = () => dynamicNodeUrl;
export const getPyUrl = () => dynamicPyUrl;

export const setApiUrls = async (nodeUrl: string, pyUrl: string) => {
  const cleanNodeUrl = nodeUrl.replace(/\/+$/, "");
  const cleanPyUrl = pyUrl.replace(/\/+$/, "");
  
  dynamicNodeUrl = cleanNodeUrl;
  dynamicPyUrl = cleanPyUrl;
  await AsyncStorage.setItem('nodeUrl', cleanNodeUrl);
  await AsyncStorage.setItem('pyUrl', cleanPyUrl);
  
  nodeApi.defaults.baseURL = cleanNodeUrl;
  pythonApi.defaults.baseURL = cleanPyUrl;
};

export const loadSavedUrls = async () => {
  const savedNode = await AsyncStorage.getItem('nodeUrl');
  const savedPy = await AsyncStorage.getItem('pyUrl');
  if (savedNode) {
    const cleanNode = savedNode.replace(/\/+$/, "");
    dynamicNodeUrl = cleanNode;
    nodeApi.defaults.baseURL = cleanNode;
  }
  if (savedPy) {
    const cleanPy = savedPy.replace(/\/+$/, "");
    dynamicPyUrl = cleanPy;
    pythonApi.defaults.baseURL = cleanPy;
  }
};

export const nodeApi = axios.create({
  baseURL: dynamicNodeUrl,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

export const pythonApi = axios.create({
  baseURL: dynamicPyUrl,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});


loadSavedUrls();
