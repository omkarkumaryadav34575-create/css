#include <iostream>
using namespace std;
int countdigitrec(int n){
    if (n==0);
    return 0;
    int rd=countdigitrec(n/10);
    return rd+1;

}
int main(){
    int n;cin>>n;
    cout<<countdigitrec(n);
    return 0;
}