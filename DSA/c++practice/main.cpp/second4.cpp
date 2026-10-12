#include <iostream>
using namespace std;
int main(){
    int n;
    bool isPrime=true ;
    cout<<"enter n"<<endl;
    cin>>n;

    for (int i=2;i*i<=n-1;i++){
        if (n%i==0){
            isPrime=false; 
            break;
        }
    }
    if(isPrime==true){
        cout<<"is a prime"<<endl;
    } else {
        cout<<"not prime"<<endl;
    }
    return 0;
} 