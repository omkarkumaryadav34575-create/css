#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    int digit;
    int biggest=0;
    while(n!=0){
        digit=n%10;
        
       
        if(digit>biggest){
            biggest=digit;
            

        }n=n/10;
        
        
    }cout<<biggest<<endl;
    return 0;
}