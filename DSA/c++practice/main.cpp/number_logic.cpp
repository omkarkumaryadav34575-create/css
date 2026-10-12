#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    cout<<n<<" ";
    int reverse;
    while (n>0){
        reverse=n%10;
        cout<<reverse;
        n=n/10;

    }cout<<endl;
    return 0;
}