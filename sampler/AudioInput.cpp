#include "AudioInput.h"

#include <iostream>

#define SAMPLE_RATE (22050)
#define CHUNK_SIZE (SAMPLE_RATE)

namespace nunni
{

AudioInput::AudioInput()
    : stream(0)
{
    PaStreamParameters  inputParameters;
    PaError             err = paNoError;
 
    std::cout << "Initializing PortAudio\n";

    err = Pa_Initialize();
    if( err != paNoError ) return;

    std::cout << "Getting default audio input device\n";

    inputParameters.device = Pa_GetDefaultInputDevice(); /* default input device */
    if (inputParameters.device == paNoDevice) {
        std::cerr << "Error: No default input device.\n";
        return;
    }
    
    inputParameters.channelCount = 1;                    /* mono input */
    inputParameters.sampleFormat = paInt16;
    inputParameters.suggestedLatency = Pa_GetDeviceInfo( inputParameters.device )->defaultLowInputLatency;
    inputParameters.hostApiSpecificStreamInfo = NULL;
 
    std::cout << "Opening stream\n";

    /* Open audio stream. -------------------------------------------- */
    err = Pa_OpenStream(
        &stream,
        &inputParameters,
        NULL,                  /* &outputParameters, */
        SAMPLE_RATE,
        CHUNK_SIZE,
        paNoFlag,
        NULL,
        NULL);

    if (err != paNoError) {
        std::cerr << "Error opening stream: " << Pa_GetErrorText(err) << '\n';
        return;
    }

    std::cout << "Audio device open\n";

    if ((err = Pa_StartStream(stream)) != paNoError) {
        std::cerr << "Error starting stream: " << Pa_GetErrorText(err) << '\n';
    }
}

AudioInput::~AudioInput()
{
    if (stream != 0) {
        Pa_CloseStream(stream);
        stream = 0;
    }
}

std::vector<short> AudioInput::record(unsigned msecs)
{
    if (!stream)
        return std::vector<short>();

    std::cout << "AudioInput::record(" << msecs << ")\n";

    PaTime startTime = Pa_GetStreamTime(stream);

    std::vector<short> samples;
    while (Pa_GetStreamTime(stream) < startTime + msecs * .001) {
        samples.resize(samples.size() + CHUNK_SIZE);
        PaError err = Pa_ReadStream(stream, &samples[samples.size() - CHUNK_SIZE], CHUNK_SIZE);
        if (err != paInputOverflowed && err != paNoError) {
            std::cerr << "Pa_ReadStream(): " << Pa_GetErrorText(err) << '\n';
            return samples;
        }
    }

    std::cout << "Recorded " << (Pa_GetStreamTime(stream) - startTime) << "s worth of audio\n";

    return samples;
}

}