#include <node.h>
#include <v8.h>
#include <uv.h>

#include <cstdlib>

#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#include "AudioInput.h"

#include "Windows.h"

#define MSECS_TO_SAMPLE (30 * 1000)

using namespace v8;

namespace nunni {

AudioInput *input = 0;

template <typename T>
void write(std::ofstream& stream, const T& t) {
  stream.write((const char*)&t, sizeof(T));
}

class SampleJob
{
    public:
        SampleJob(const Persistent<Function> &cb)
            : cb(cb)
        {
            req.data = this;

            uv_queue_work(uv_default_loop(), &req, &SampleJob::doSample, &SampleJob::invokeCallback);
        }

        static void doSample(uv_work_t *req)
        {
            SampleJob *self = static_cast<SampleJob *>(req->data);

            std::cout << "Recording audio\n";

            std::vector<short> samples = input->record(MSECS_TO_SAMPLE);

            std::cout << "Writing " << samples.size() << " audio samples to temp file" << std::endl;

            std::ofstream stream("audio.wav", std::ios_base::binary | std::ios_base::trunc);

            uint32_t dataSize = samples.size() * sizeof(samples[0]);

  stream.write("RIFF", 4);
  write<int>(stream, 36 + samples.size() * sizeof(samples[0]));
  stream.write("WAVE", 4);
  stream.write("fmt ", 4);
  write<int>(stream, 16);
  write<short>(stream, 1);                                        // Format (1 = PCM)
  write<short>(stream, 1);                                 // Channels
  write<int>(stream, 22050);                                 // Sample Rate
  write<int>(stream, 22050 * 1 * sizeof(samples[0])); // Byterate
  write<short>(stream, 1 * sizeof(samples[0]));            // Frame size
  write<short>(stream, 8 * sizeof(samples[0]));                   // Bits per sample
  stream.write("data", 4);
  stream.write((const char*)&dataSize, 4);
  stream.write((const char*)&samples[0], dataSize);

            stream.close();

            PROCESS_INFORMATION piProcInfo; 
            STARTUPINFO siStartInfo;
            BOOL bSuccess = FALSE; 
 
            ZeroMemory( &piProcInfo, sizeof(PROCESS_INFORMATION) );
            ZeroMemory( &siStartInfo, sizeof(STARTUPINFO) );

            std::cout << "Spawning codegen child" << std::endl;

            if (!CreateProcess("C:\\windows\\system32\\cmd.exe", "/C codegen.exe audio.wav > code.out", NULL, NULL, TRUE, NORMAL_PRIORITY_CLASS | CREATE_NO_WINDOW, NULL, NULL, &siStartInfo, &piProcInfo)) {
                // CreateProcess() failed
                // Get the error from the system
                LPVOID lpMsgBuf;
                DWORD dw = GetLastError();
                FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, 
                    NULL, dw, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPTSTR) &lpMsgBuf, 0, NULL);
                std::cout << "CreateProcess(): " << reinterpret_cast<const char *>(lpMsgBuf) << '\n';
                return;
            }
            
            std::cout << "Waiting for child process to finish" << std::endl;
            
            WaitForSingleObject(piProcInfo.hProcess, INFINITE);

            Sleep(100);

            std::cout << "Reading fingerprint" << std::endl;

            std::ifstream ifs("code.out", std::ios_base::binary | std::ios_base::in);
            ifs.seekg(0, std::ios_base::end);
            self->result.resize(ifs.tellg());
            ifs.seekg(0, std::ios_base::beg);
            ifs.read(&self->result[0], self->result.size());

            std::cout << "Read fingerprint with length " << self->result.size() << std::endl;
        }

        static void invokeCallback(uv_work_t *req, int status)
        {
            HandleScope scope;

            SampleJob *self = static_cast<SampleJob *>(req->data);

            std::vector<Local<Value > > cbArgs;

            if (!self->result.empty()) {
                cbArgs.push_back(Local<Value>::New(String::New(self->result.c_str())));
            }

            node::MakeCallback(
                    Context::GetCurrent()->Global(),
                    self->cb,
                    int(cbArgs.size()),
                    &cbArgs[0]);

            self->cb.Dispose();
            self->cb.Clear();

            delete self;
        }

    private:
        Persistent<Function> cb;
        uv_work_t req;
        std::string result;
};

Handle<Value> sample(const Arguments &args)
{
    HandleScope scope;

    Persistent<Function> cb = Persistent<Function>::New(args[0].As<Function>());

    new SampleJob(cb);

    return Undefined();
}

} // namespace nunni {

void init(Handle<Object> exports)
{
    nunni::input = new nunni::AudioInput();

    exports->Set(String::NewSymbol("sample"),
            FunctionTemplate::New(nunni::sample)->GetFunction());
}

NODE_MODULE(sampler, init);
