#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    int digit;
    int count=0;
    while(n!=0){
        digit=n%10;
        
       
        if(digit==7){
            count++;
            

        }n=n/10;
        
        
    }cout<<count <<endl;
    return 0;
}