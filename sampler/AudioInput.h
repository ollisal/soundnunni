#ifndef AUDIOINPUT_H
#define AUDIOINPUT_H

#include <vector>

#include <portaudio.h>

namespace nunni {

class AudioInput
{
public:
    AudioInput();
    ~AudioInput();

    std::vector<short> record(unsigned msecs);

private:

    PaStream *stream;
};

} // namespace nunni

#endif