import { SoundObject } from './soundObject';

describe('SoundObject', () => {
  let soundObject: SoundObject;

  beforeEach(() => {
    soundObject = new SoundObject();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create an instance of SoundObject', () => {
    expect(soundObject).toBeInstanceOf(SoundObject);
  });

  test('should set and get audio', async () => {
    const mockArrayBuffer = new ArrayBuffer(8);
    const mockAudioBuffer = {};
    const mockBufferSource = {
      buffer: null,
      connect: jest.fn(),
    };

    global.AudioContext = jest.fn().mockImplementation(() => ({
      decodeAudioData: jest.fn().mockResolvedValue(mockAudioBuffer),
      createBufferSource: jest.fn().mockReturnValue(mockBufferSource),
      destination: {},
    }));

    await soundObject.setAudio(mockArrayBuffer);

    expect(soundObject.getAudio()).toBe(mockAudioBuffer);
    expect(mockBufferSource.buffer).toBe(mockAudioBuffer);
    expect(mockBufferSource.connect).toHaveBeenCalledWith(soundObject.getContext().destination);
  });

  test('should set and get audio context', () => {
    const mockContext = {};
    soundObject.setContext(mockContext);
    expect(soundObject.getContext()).toBe(mockContext);
  });

  test('should load and set audio asynchronously', async () => {
    const mockArrayBuffer = new ArrayBuffer(8);
    const mockAudioBuffer = {};
    const mockBufferSource = {
      buffer: null,
      connect: jest.fn(),
    };

    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
    });

    global.AudioContext = jest.fn().mockImplementation(() => ({
      decodeAudioData: jest.fn().mockResolvedValue(mockAudioBuffer),
      createBufferSource: jest.fn().mockReturnValue(mockBufferSource),
      destination: {},
    }));

    await soundObject.setAudioAsync('test.mp3');

    expect(global.fetch).toHaveBeenCalledWith('test.mp3');
    expect(soundObject.getAudio()).toBe(mockAudioBuffer);
    expect(mockBufferSource.buffer).toBe(mockAudioBuffer);
    expect(mockBufferSource.connect).toHaveBeenCalledWith(soundObject.getContext().destination);
  });

  test('should play audio', async () => {
    soundObject.source = {
      start: jest.fn(),
    };

    await soundObject.play();

    expect(soundObject.source.start).toHaveBeenCalledWith(0);
  });

  test('should stop audio', async () => {
    soundObject.source = {
      stop: jest.fn(),
    };

    await soundObject.stop();

    expect(soundObject.source.stop).toHaveBeenCalled();
  });
});