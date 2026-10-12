#include <iostream>
using namespace std;
int main(){
    int n;
    int o=1;
    cout<<"enter n"<<endl;
    cin>>n;
    for(int i=0;i<n;i++){


        for(int j=0;j<n;j++){
            cout<<o<<" ";
            o++;


        }
        cout<<endl;

    }
    cout<<"after pattern: "<<o;

        return 0;
}