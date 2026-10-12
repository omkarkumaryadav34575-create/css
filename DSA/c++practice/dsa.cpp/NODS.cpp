#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    int digit;
    int sum=0;
    while(n!=0){
        digit=n%10;
        n=n/10;
        sum+=digit;
    }cout<<sum<<endl;
    return 0;
}